'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Coins, CheckCircle } from "lucide-react"

// Define expected props (wallet connection status removed)
interface TokenInfoCardProps {
  tokenName?: string | null;
  tokenSymbol?: string | null;
  totalSupply?: string | null; // Formatted string
  contractAddress?: string | null;
  recipientAddress?: string | null; // Added recipient address
  isLoading?: boolean;
}

export function TokenInfoCard({ 
  tokenName = "Loading...", 
  tokenSymbol = "--", 
  totalSupply = "--", 
  contractAddress,
  recipientAddress, // Added recipient address prop
  isLoading = true 
}: TokenInfoCardProps) {

  // Display placeholder if loading
  if (isLoading) {
    tokenName = "Loading...";
    tokenSymbol = "--";
    totalSupply = "--";
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5 text-green-600" />
          <span>Carbon Credit Token Status</span>
        </CardTitle>
        <CardDescription>
          Information about the AtmoSieve Carbon Credit (ACC) token on the network.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500 mb-1">Token Name</p>
            <p className="font-medium">{tokenName || "N/A"}</p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Symbol</p>
            <Badge variant="outline">{tokenSymbol || "N/A"}</Badge>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Total Supply</p>
            <p className="font-medium">{totalSupply || "N/A"} {tokenSymbol && tokenSymbol !== "--" ? tokenSymbol : ""}</p>
          </div>
          {recipientAddress && (
             <div className="col-span-1 md:col-span-2">
                 <p className="text-gray-500 mb-1 flex items-center gap-1">
                   <CheckCircle className="h-4 w-4 text-green-600"/>
                   <span>Designated Token Recipient</span>
                 </p>
                 <p className="font-mono text-xs break-all">{recipientAddress}</p>
             </div>
          )}
          {contractAddress && (
             <div className="col-span-1 md:col-span-2">
                 <p className="text-gray-500 mb-1">Contract Address</p>
                 <p className="font-mono text-xs break-all">{contractAddress}</p>
             </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 