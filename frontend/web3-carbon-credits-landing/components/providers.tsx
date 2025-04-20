'use client' // <<< Mark as Client Component

import { ReactNode, useState } from 'react'
import { http, createConfig, WagmiProvider } from 'wagmi'
import { defineChain } from 'viem'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Define Westend Asset Hub Chain (moved here)
const westendAssetHub = defineChain({
  id: 420420421, 
  name: 'Westend Asset Hub',
  nativeCurrency: { name: 'Westend Asset Hub Token', symbol: 'WND', decimals: 12 },
  rpcUrls: {
    default: {
      http: ['https://westend-asset-hub-eth-rpc.polkadot.io'],
    },
  },
  blockExplorers: {
    default: { name: 'Subscan', url: 'https://westendassethub.subscan.io' },
  },
  testnet: true,
})

// Create Wagmi config (moved here)
const config = createConfig({
  chains: [westendAssetHub],
  transports: {
    [westendAssetHub.id]: http()
  },
  // ssr: true, // We might not need ssr flag when config is client-side only
})

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  // Create React Query Client instance within the client component
  // Use useState to ensure client is only created once per render lifecycle
  const [queryClient] = useState(() => new QueryClient());

  return (
    // Pass the client-side created config
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
} 