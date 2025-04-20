import { ReactNode } from 'react';
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

// Import the client component provider wrapper
import { Providers } from '@/components/providers'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'AtmoSieve Dashboard',
  description: 'Carbon Capture and Tokenization Dashboard',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        {/* Use the Providers component without passing props */}
        <Providers>
            {children}
        </Providers>
      </body>
    </html>
  )
}
