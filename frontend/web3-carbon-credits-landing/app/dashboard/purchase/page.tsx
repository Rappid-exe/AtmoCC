"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Check, Info, ShoppingCart, Shield, Leaf, BarChart, Building, Coins, Zap, Lock, Hash, MapPin, Factory, X, ExternalLink, FileText, Cpu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { TokenInfoCard } from "@/components/token-info-card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter
} from "@/components/ui/dialog"

// Wagmi Imports
import { useReadContracts } from 'wagmi'
import { formatUnits } from 'viem' 

// Import Contract ABI (Make sure this path is correct if you moved the ABI)
import CarbonCreditTokenABI from '@/lib/abi/CarbonCreditTokenMinimized.json' // <<< Assume ABI is saved here

// Hardcode the designated recipient address
const DESIGNATED_RECIPIENT = "0xF9755E5682fd9492A7ee19d852a8d6e6661C7663";

// Sample credit packages
const creditPackages = [
  {
    id: 1,
    name: "Starter",
    amount: "10",
    price: "249",
    description: "Perfect for small businesses looking to offset their carbon footprint.",
    features: ["10 tons of CO₂ offset", "Blockchain certificate", "Monthly impact report"],
    popular: false,
  },
  {
    id: 2,
    name: "Business",
    amount: "50",
    price: "1,199",
    description: "Ideal for medium-sized companies with moderate carbon emissions.",
    features: [
      "50 tons of CO₂ offset",
      "Blockchain certificate",
      "Monthly impact report",
      "Customized sustainability badge",
    ],
    popular: true,
  },
  {
    id: 3,
    name: "Enterprise",
    amount: "250",
    price: "5,499",
    description: "Comprehensive solution for larger organizations with significant carbon footprints.",
    features: [
      "250 tons of CO₂ offset",
      "Blockchain certificate",
      "Monthly impact report",
      "Customized sustainability badge",
      "Dedicated account manager",
      "Annual sustainability consultation",
    ],
    popular: false,
  },
]

// Sample data - replace with real data fetching later
const pricePerToken = 0.005 // Example price in WND or other currency
const availableSupply = 47250 // Example supply

// Define contract details
const contractConfig = {
    address: '0x906781a08765C862Ba6D6bB0baF29679bd33216F' as `0x${string}`,
    abi: CarbonCreditTokenABI,
} as const // Use 'as const' for better type inference with wagmi

// --- Define Type for Success Card Data ---
type TransactionResult = {
  txHash: string;
  amount: number;
  systemId: string; // Can be enhanced later
};

export default function PurchasePage() {
  const router = useRouter()
  const [selectedPackage, setSelectedPackage] = useState(creditPackages[1].id)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState("packages")
  const [companyName, setCompanyName] = useState("")
  const [companyAddress, setCompanyAddress] = useState("")
  const [amountToPurchase, setAmountToPurchase] = useState(100) // Default amount
  const [estimatedCost, setEstimatedCost] = useState(amountToPurchase * pricePerToken)
  const [paymentMethod, setPaymentMethod] = useState("wnd")
  const [isPurchasing, setIsPurchasing] = useState(false); // Add loading state for purchase
  // --- Add State for Success Card ---
  const [transactionResult, setTransactionResult] = useState<TransactionResult | null>(null);

  // --- Fetch Web3 Data (excluding user balance) --- 
  const { data: tokenDataResult, isLoading: tokenDataLoading, isError: tokenDataError } = useReadContracts({ 
      allowFailure: false, 
      contracts: [
          { ...contractConfig, functionName: 'name' },
          { ...contractConfig, functionName: 'symbol' },
          { ...contractConfig, functionName: 'decimals' },
          { ...contractConfig, functionName: 'totalSupply' },
      ]
  })

  // --- Process and Format Web3 Data (excluding user balance) --- 
  const processedTokenData = useMemo(() => {
    if (tokenDataError || !tokenDataResult) {
      return {
        tokenName: "Error",
        tokenSymbol: "ERR",
        totalSupply: "Error",
        decimals: 18, 
      };
    }

    const [name, symbol, decimals, totalSupply] = tokenDataResult;
    const tokenDecimals = typeof decimals === 'number' ? decimals : 18;

    return {
      tokenName: typeof name === 'string' ? name : "N/A",
      tokenSymbol: typeof symbol === 'string' ? symbol : "N/A",
      totalSupply: typeof totalSupply === 'bigint' ? formatUnits(totalSupply, tokenDecimals) : "N/A",
      decimals: tokenDecimals,
    };
  }, [tokenDataResult, tokenDataError]);

  const selectedPkg = creditPackages.find((pkg) => pkg.id === selectedPackage)
  const totalPrice = selectedPkg ? Number.parseInt(selectedPkg.price.replace(",", "")) * quantity : 0
  const formattedTotalPrice = totalPrice.toLocaleString()

  // --- Restore original handleCheckout for Package Purchases ---
  const handleCheckout = () => {
    if (!selectedPkg) return; // Safety check
    // Pass the selected package details and company info to the completion page
    const totalAmount = Number.parseInt(selectedPkg?.amount.replace(",", "") || "0") * quantity
    const params = new URLSearchParams({
      amount: totalAmount.toString(),
      package: selectedPkg?.name || "",
      companyName: companyName || "",
      companyAddress: companyAddress || "",
    })
    // Navigate to the completion page
    router.push(`/dashboard/purchase/complete?${params.toString()}`)
  }

  const handleAmountChange = (value: number[]) => {
    const newAmount = value[0]
    setAmountToPurchase(newAmount)
    setEstimatedCost(newAmount * pricePerToken)
  }

  // --- Simplify handlePurchase for ACC Token Purchases ---
  const handlePurchase = async () => { // Removed optional amount parameter
    // const finalAmount = amount ?? amountToPurchase; // Removed
    const finalAmount = amountToPurchase; // Use state directly

    if (finalAmount <= 0) {
      alert("Please enter a valid amount to purchase.");
      return;
    }

    console.log("Initiating ACC Token purchase via backend:", {
      amount: finalAmount,
      recipient: DESIGNATED_RECIPIENT,
    })
    setIsPurchasing(true);
    setTransactionResult(null);

    try {
        const response = await fetch('http://127.0.0.1:5001/api/mint-credits-backend', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: finalAmount,
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || `Backend request failed: ${response.statusText}`);
        }

        console.log("Backend minting response:", result);
        setTransactionResult({
          txHash: result.txHash,
          amount: finalAmount,
          systemId: result.systemId || 'Custom ACC Purchase' // Updated default systemId
        });

    } catch (error) {
        console.error("Purchase failed:", error);
        setTransactionResult(null);
        alert(`Purchase failed: ${error instanceof Error ? error.message : "Unknown error"}. Please try again.`);
    } finally {
        setIsPurchasing(false);
    }
  }

  // --- Subscan Link Base ---
  const subscanBaseUrl = "https://assethub-westend.subscan.io/tx/";

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold mb-2">Purchase Carbon Credits</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Offset your carbon footprint with verified carbon credits from ATMOSIEVE's atmospheric capture facilities.
          Each credit represents one metric ton of CO₂ removed from the atmosphere.
        </p>
      </div>

      {/* Display Token Information Card - Removed isConnected/userBalance */}
      <TokenInfoCard 
          isLoading={tokenDataLoading}
          tokenName={processedTokenData.tokenName}
          tokenSymbol={processedTokenData.tokenSymbol}
          totalSupply={processedTokenData.totalSupply}
          contractAddress={contractConfig.address}
          recipientAddress={DESIGNATED_RECIPIENT} // Pass fixed recipient
      />

      {/* --- Success Card (Only for ACC Token Purchase now) --- */}
      {transactionResult && (
        <Dialog>
          <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 text-gray-200 rounded-lg shadow-xl p-6 mt-8 border border-gray-700 animate-fade-in">
            {/* Dismiss Button for the CARD itself */}
            <button
              onClick={() => setTransactionResult(null)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
              aria-label="Dismiss Success Card"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-semibold mb-4 text-green-400 flex items-center">
              <Check size={24} className="mr-2" /> Purchase Successful!
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center text-gray-400"><Leaf size={16} className="mr-2 text-green-500" /> Amount Purchased:</span>
                <span className="font-medium text-white">{transactionResult.amount} {processedTokenData.tokenSymbol || 'Tokens'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center text-gray-400"><Building size={16} className="mr-2 text-cyan-400" /> Capture Facility:</span>
                <span className="font-medium text-white">Sierra Nevada Facility</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center text-gray-400"><MapPin size={16} className="mr-2 text-purple-400" /> Location:</span>
                <span className="font-medium text-white">California</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center text-gray-400"><Cpu size={16} className="mr-2 text-blue-400" /> Facility ID:</span>
                <span className="font-medium text-white">AC:SN002</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center text-gray-400"><Hash size={16} className="mr-2 text-orange-400" /> Transaction Hash:</span>
                <span className="font-medium text-white truncate hover:underline">
                  <a
                    href={`${subscanBaseUrl}${transactionResult.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={transactionResult.txHash}
                    className="flex items-center hover:text-blue-300 transition-colors"
                  >
                    {`${transactionResult.txHash.substring(0, 8)}...${transactionResult.txHash.substring(transactionResult.txHash.length - 8)}`}
                    <ExternalLink size={14} className="ml-1" />
                  </a>
                </span>
              </div>
            </div>

            {/* --- Replace Link with Dialog Trigger --- */}
            <div className="mt-6 pt-4 border-t border-gray-700 flex justify-center">
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-gray-300 border-gray-600 hover:bg-gray-700 hover:text-white"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  View Certificate Details
                </Button>
              </DialogTrigger>
            </div>
          </div>

          {/* --- Dialog Content (Modal) --- */}
          <DialogContent className="sm:max-w-md bg-gradient-to-br from-gray-800 to-gray-900 text-gray-200 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-green-400 flex items-center">
                 <FileText className="mr-2 h-5 w-5" /> Certificate Details
              </DialogTitle>
              <DialogDescription className="text-gray-400 pt-2">
                 This certificate confirms the details of your Atmosieve Carbon Credit purchase.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 text-sm">
              {/* Modal Content Details */}
               <div className="flex items-center justify-between">
                 <span className="flex items-center text-gray-400"><Leaf size={16} className="mr-2 text-green-500" /> Token Amount:</span>
                 <span className="font-medium text-white">{transactionResult.amount} {processedTokenData.tokenSymbol || 'Tokens'}</span>
               </div>
                <div className="flex items-center justify-between">
                 <span className="flex items-center text-gray-400"><Building size={16} className="mr-2 text-cyan-400" /> Capture Facility:</span>
                 <span className="font-medium text-white">Sierra Nevada Facility</span>
               </div>
                <div className="flex items-center justify-between">
                 <span className="flex items-center text-gray-400"><MapPin size={16} className="mr-2 text-purple-400" /> Location:</span>
                 <span className="font-medium text-white">California</span>
               </div>
               <div className="flex items-center justify-between">
                 <span className="flex items-center text-gray-400"><Cpu size={16} className="mr-2 text-blue-400" /> Facility ID:</span>
                 <span className="font-medium text-white">AC:SN002</span>
               </div>
               <div className="flex items-center justify-between">
                 <span className="flex items-center text-gray-400"><Hash size={16} className="mr-2 text-orange-400" /> Transaction Hash:</span>
                 <span className="font-mono text-xs text-white bg-gray-700 px-2 py-1 rounded break-all">
                   {transactionResult.txHash}
                  </span>
               </div>
               {/* Subscan Link in Modal */}
               <div className="flex items-center justify-between">
                  <span className="text-gray-400">Verify On-Chain:</span>
                  <a
                    href={`${subscanBaseUrl}${transactionResult.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-300 hover:text-blue-200 transition-colors underline"
                  >
                    View on Subscan
                    <ExternalLink size={14} className="ml-1" />
                  </a>
               </div>
            </div>
            <DialogFooter className="sm:justify-end">
              <DialogClose asChild>
                <Button type="button" variant="secondary" size="sm" className="text-gray-300 border-gray-600 hover:bg-gray-700 hover:text-white">
                  Close
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <Tabs defaultValue="packages" className="w-full mt-8" onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
          <TabsTrigger value="packages">Credit Packages</TabsTrigger>
          <TabsTrigger value="custom">Buy ACC Tokens</TabsTrigger>
        </TabsList>

        <TabsContent value="packages">
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {creditPackages.map((pkg) => (
              <Card
                key={pkg.id}
                className={`relative overflow-hidden ${
                  selectedPackage === pkg.id ? "border-2 border-blue-500" : ""
                } ${pkg.popular ? "shadow-lg" : ""}`}
              >
                {pkg.popular && (
                  <div className="absolute top-0 right-0">
                    <Badge className="m-2 bg-blue-500">Most Popular</Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{pkg.name}</CardTitle>
                  <CardDescription>{pkg.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <span className="text-3xl font-bold">${pkg.price}</span>
                    <span className="text-gray-500 ml-1">/ one-time</span>
                  </div>
                  <div className="text-lg font-medium mb-4">
                    <Leaf className="inline-block mr-2 h-5 w-5 text-green-500" />
                    {pkg.amount} Carbon Credits
                  </div>
                  <ul className="space-y-2">
                    {pkg.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className={`w-full ${selectedPackage === pkg.id ? "bg-blue-500 hover:bg-blue-600" : ""}`}
                    onClick={() => setSelectedPackage(pkg.id)}
                  >
                    {selectedPackage === pkg.id ? "Selected" : "Select Package"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="custom">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Buy ACC Tokens Directly</CardTitle>
              <CardDescription>
                Specify the exact amount of Atmosieve Carbon Credits ({processedTokenData.tokenSymbol}) you wish to purchase via direct minting.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="amount" className="flex justify-between">
                  <span>Amount ({processedTokenData.tokenSymbol})</span>
                  <span className="font-bold text-lg">{amountToPurchase}</span>
                </Label>
                <Slider
                  id="amount"
                  min={1}
                  max={1000} // Adjust max as needed
                  step={1}
                  value={[amountToPurchase]}
                  onValueChange={handleAmountChange}
                  disabled={isPurchasing}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={() => handlePurchase()}
                disabled={isPurchasing || amountToPurchase <= 0}
              >
                {isPurchasing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing Purchase...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-4 w-4" /> Purchase {amountToPurchase} {processedTokenData.tokenSymbol} Tokens
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {activeTab === "packages" && (
        <div className="max-w-3xl mx-auto mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b">
                  <div>
                    <h3 className="font-medium">{selectedPkg?.name} Package</h3>
                    <p className="text-sm text-gray-500">{selectedPkg?.amount} Carbon Credits</p>
                  </div>
                  <div className="flex items-center">
                    <div className="flex items-center mr-6">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                      >
                        -
                      </Button>
                      <span className="mx-3 w-8 text-center">{quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={() => setQuantity(quantity + 1)}
                      >
                        +
                      </Button>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">${formattedTotalPrice}</div>
                      <div className="text-sm text-gray-500">
                        ${selectedPkg?.price} × {quantity}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pb-4 border-b">
                  <div className="font-medium">Total Carbon Offset</div>
                  <div className="font-medium">
                    {Number.parseInt(selectedPkg?.amount.replace(",", "") || "0") * quantity} tons CO₂
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="font-medium text-lg">Total</div>
                  <div className="font-bold text-lg">${formattedTotalPrice}</div>
                </div>
              </div>

              <Accordion type="single" collapsible className="mt-6">
                <AccordionItem value="company-info">
                  <AccordionTrigger className="text-sm font-medium">
                    <div className="flex items-center">
                      <Building className="mr-2 h-4 w-4" />
                      Company Information (Optional)
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 pt-2">
                      <div className="grid gap-2">
                        <Label htmlFor="company-name">Company Name</Label>
                        <Input
                          id="company-name"
                          placeholder="Enter company name for certificate"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                        />
                        <p className="text-xs text-gray-500">
                          If left blank, "Contra Corporation" will be used on the certificate.
                        </p>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="company-address">Company Address</Label>
                        <Textarea
                          id="company-address"
                          placeholder="Enter company address"
                          rows={3}
                          value={companyAddress}
                          onChange={(e) => setCompanyAddress(e.target.value)}
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Save for Later</Button>
              <Button 
                className="bg-green-600 hover:bg-green-700" 
                onClick={handleCheckout}
                disabled={!selectedPkg || quantity <= 0}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Proceed to Checkout
              </Button>
            </CardFooter>
          </Card>

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start">
            <Info className="h-5 w-5 text-blue-500 mr-3 mt-0.5 shrink-0" />
            <div>
              <h4 className="font-medium text-blue-800">About Our Carbon Credits</h4>
              <p className="text-sm text-blue-700 mt-1">
                All carbon credits are backed by real atmospheric carbon capture at our facilities. Each credit is
                tokenized on the blockchain, providing transparent verification and traceability. Upon purchase,
                you'll receive a digital certificate and the ability to track the impact of your offset.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-12 grid md:grid-cols-3 gap-8">
        <div className="text-center">
          <div className="bg-green-100 rounded-full p-3 w-12 h-12 flex items-center justify-center mx-auto mb-4">
            <Leaf className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="font-medium mb-2">Verified Carbon Removal</h3>
          <p className="text-sm text-gray-600">
            Each credit represents one metric ton of CO₂ physically removed from the atmosphere by our facilities.
          </p>
        </div>
        <div className="text-center">
          <div className="bg-blue-100 rounded-full p-3 w-12 h-12 flex items-center justify-center mx-auto mb-4">
            <Shield className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="font-medium mb-2">Blockchain Verified</h3>
          <p className="text-sm text-gray-600">
            All credits are tokenized on the blockchain, providing transparent and immutable proof of your carbon
            offset.
          </p>
        </div>
        <div className="text-center">
          <div className="bg-purple-100 rounded-full p-3 w-12 h-12 flex items-center justify-center mx-auto mb-4">
            <BarChart className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="font-medium mb-2">Impact Tracking</h3>
          <p className="text-sm text-gray-600">
            Track the environmental impact of your carbon offset with detailed reports and analytics.
          </p>
        </div>
      </div>
    </main>
  )
}
