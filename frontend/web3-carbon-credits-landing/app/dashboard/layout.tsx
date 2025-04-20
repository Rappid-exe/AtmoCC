'use client'

import "./styles.css"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, BarChart3, Download, ShoppingCart } from "lucide-react"
import { ReactNode } from 'react'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Shared Dashboard Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              {/* Removed back button - maybe add conditionally? */}
              <h1 className="text-xl font-bold">ATMOSIEVE TECHNOLOGIES</h1>
              <Badge variant="outline" className="ml-2">
                Dashboard
              </Badge>
            </div>
            <div className="flex items-center gap-4"> {/* Increased gap */} 
              <Button variant="outline" size="sm">
                <BarChart3 className="h-4 w-4 mr-2" />
                Reports
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Link href="/dashboard/purchase">
                <Button size="sm" variant="default" className="bg-green-600 hover:bg-green-700">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Buy Credits
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Page content */} 
      <main>{children}</main>
    </div>
  )
}
