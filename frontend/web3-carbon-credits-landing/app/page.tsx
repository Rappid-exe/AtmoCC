"use client"
import { motion } from "framer-motion"
import { ArrowRight, CloudLightning, BarChart, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <header className="container mx-auto px-4 py-8">
        <nav className="flex justify-between items-center mb-16">
          <div className="text-2xl font-bold">ATMOSIEVE TECHNOLOGIES, INC.</div>
          <div className="space-x-8">
            <Button variant="link">About</Button>
            <Button variant="link">Technology</Button>
            <Button variant="link">Contact</Button>
            <Button variant="outline">Learn More</Button>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <motion.h1
              className="text-5xl md:text-7xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Pioneering Atmospheric Carbon Capture and Tokenization
            </motion.h1>
            <motion.p
              className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              ATMOSIEVE TECHNOLOGIES combines cutting-edge carbon capture technology with blockchain to create a new
              standard in verifiable, tradable carbon credits.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700" asChild>
                <Link href="/dashboard">
                  Get Started <ArrowRight className="ml-2" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">The ATMOSIEVE Advantage</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <FeatureCard
                icon={<CloudLightning className="w-8 h-8 text-blue-600" />}
                title="Advanced Capture"
                description="Proprietary technology for efficient atmospheric carbon extraction."
              />
              <FeatureCard
                icon={<BarChart className="w-8 h-8 text-green-600" />}
                title="Blockchain Verification"
                description="Immutable record of carbon credits on a transparent ledger."
              />
              <FeatureCard
                icon={<Globe className="w-8 h-8 text-purple-600" />}
                title="Global Impact"
                description="Contribute to climate action through our tokenized credit system."
              />
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Our Process</h2>
            <div className="flex flex-col md:flex-row justify-center items-center space-y-8 md:space-y-0 md:space-x-12">
              <StepCard number="1" title="Atmospheric Extraction" />
              <StepCard number="2" title="Carbon Quantification" />
              <StepCard number="3" title="Credit Tokenization" />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-blue-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Join the Carbon Revolution</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Be part of the solution. Learn how ATMOSIEVE TECHNOLOGIES is reshaping the carbon credit market with
              blockchain and advanced capture technology.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Input placeholder="Enter your email" className="max-w-xs bg-white text-gray-900" />
              <Button size="lg" variant="secondary">
                Get Informed
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-100 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-xl font-bold mb-4 md:mb-0">ATMOSIEVE TECHNOLOGIES, INC.</div>
            <div className="flex space-x-8">
              <a href="#" className="text-gray-600 hover:text-gray-900">
                Terms
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900">
                Privacy
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-900">
                Contact
              </a>
            </div>
          </div>
          <div className="mt-8 text-center text-sm text-gray-500">
            © 2024 ATMOSIEVE TECHNOLOGIES, INC. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }) {
  return (
    <motion.div
      className="text-center"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </motion.div>
  )
}

function StepCard({ number, title }) {
  return (
    <motion.div
      className="flex flex-col items-center"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      <div className="text-3xl font-bold text-blue-600 mb-2">{number}</div>
      <h3 className="text-xl font-semibold">{title}</h3>
    </motion.div>
  )
}
