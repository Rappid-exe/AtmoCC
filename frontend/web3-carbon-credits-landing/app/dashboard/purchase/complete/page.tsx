"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, CheckCircle, Download, Share2, Shield, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { shortenAddress } from "@/lib/utils"

// Sample locations for the certificate
const locations = [
  {
    name: "Sierra Nevada Facility",
    state: "California",
    deviceId: "AC:SN001",
  },
  {
    name: "Gulf Coast Plant",
    state: "Texas",
    deviceId: "AC:GC002",
  },
  {
    name: "Great Lakes Center",
    state: "Michigan",
    deviceId: "AC:GL003",
  },
  {
    name: "Mojave Desert Array",
    state: "Nevada",
    deviceId: "AC:MD004",
  },
]

// Hardcode the recipient address for the certificate display
const DESIGNATED_RECIPIENT = "0xF9755E5682fd9492A7ee19d852a8d6e6661C7663";

export default function PurchaseCompletePage() {
  const searchParams = useSearchParams()
  const [showCertificate, setShowCertificate] = useState(false)
  const [showConfetti, setShowConfetti] = useState(true)

  // Get parameters from URL
  const amount = searchParams.get("amount") || "50"
  const packageName = searchParams.get("package") || "Business"
  const companyName = searchParams.get("companyName") || "Contra Corporation"
  const companyAddress = searchParams.get("companyAddress") || ""

  // Randomly select a location for the certificate
  const location = locations[Math.floor(Math.random() * locations.length)]

  // Generate a unique certificate ID
  const certificateId = `ATM-${Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0")}-${new Date().getFullYear()}`

  // Current date formatted for the certificate
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  useEffect(() => {
    // Show success animation first, then reveal certificate
    const timer = setTimeout(() => {
      setShowCertificate(true)
      setShowConfetti(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <h1 className="text-xl font-bold">ATMOSIEVE TECHNOLOGIES</h1>
              <Badge variant="outline" className="ml-2">
                Purchase Complete
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!showCertificate ? (
          <motion.div
            className="flex flex-col items-center justify-center py-16"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: [0.8, 1.2, 1] }}
              transition={{ duration: 1, times: [0, 0.6, 1] }}
            >
              <CheckCircle className="h-24 w-24 text-green-500 mb-6" />
            </motion.div>
            <motion.h2
              className="text-3xl font-bold mb-4 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Purchase Successful!
            </motion.h2>
            <motion.p
              className="text-xl text-gray-600 text-center max-w-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              Thank you for offsetting {amount} tons of CO₂. Your certificate is being generated...
            </motion.p>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center">
            <h2 className="text-2xl font-bold mb-6 text-center">Your Carbon Offset Certificate</h2>

            <motion.div
              className="w-full max-w-3xl"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <div className="certificate-container">
                <div className="certificate-content">
                  <div className="certificate-header">
                    <div className="certificate-logo">
                      <div className="logo-text">ATMOSIEVE</div>
                      <div className="logo-subtext">TECHNOLOGIES, INC.</div>
                    </div>
                    <h1>CERTIFICATE OF CARBON OFFSET</h1>
                    <div className="certificate-subtitle">Verified Atmospheric Carbon Removal</div>
                  </div>

                  <div className="certificate-body">
                    <div className="certificate-statement">
                      <p>This certifies that</p>
                      <h2>{companyName}</h2>
                      {companyAddress && <p className="company-address">{companyAddress}</p>}
                      <p>has offset</p>
                      <div className="certificate-amount">{amount} Metric Tons of CO₂</div>
                      <p>through direct air capture technology</p>
                    </div>

                    <div className="certificate-details">
                      <div className="detail-item">
                        <div className="detail-label">Carbon Capture Location</div>
                        <div className="detail-value">{location.name}</div>
                        <div className="detail-subvalue">{location.state}, USA</div>
                      </div>
                      <div className="detail-item">
                        <div className="detail-label">Carbon Capture Device ID</div>
                        <div className="detail-value">{location.deviceId}</div>
                      </div>
                      <div className="detail-item">
                        <div className="detail-label">Certificate ID</div>
                        <div className="detail-value">{certificateId}</div>
                      </div>
                      <div className="detail-item">
                        <div className="detail-label">Issue Date</div>
                        <div className="detail-value">{currentDate}</div>
                      </div>
                    </div>

                    <div className="certificate-verification">
                      <div className="verification-signature">
                        <div className="signature-line"></div>
                        <div className="signature-name">John Doe</div>
                        <div className="signature-title">Chief Verification Officer</div>
                      </div>
                      <div className="verification-seal">
                        <div className="blockchain-seal">
                          <div className="blockchain-icon">
                            <Shield className="icon-shield" />
                            <Lock className="icon-lock" />
                          </div>
                          <div className="blockchain-text">BLOCKCHAIN VERIFIED</div>
                          <div className="blockchain-recipient" title={DESIGNATED_RECIPIENT}>
                             Recipient: {shortenAddress(DESIGNATED_RECIPIENT, 6)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="certificate-footer">
                    <div className="footer-text">
                      This certificate represents carbon dioxide physically removed from the atmosphere and securely
                      sequestered. Verified on the blockchain and backed by ATMOSIEVE TECHNOLOGIES, INC.
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="flex gap-4 mt-8">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Download Certificate
              </Button>
              <Button variant="outline">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
              <Link href="/dashboard">
                <Button>Return to Dashboard</Button>
              </Link>
            </div>
          </div>
        )}
      </main>

      {showConfetti && (
        <div className="confetti-container">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)`,
              }}
            ></div>
          ))}
        </div>
      )}
    </div>
  )
}
