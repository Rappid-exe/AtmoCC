'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { injected } from 'wagmi/connectors' // Basic connector for browser wallets like MetaMask
import { Button } from "@/components/ui/button"
import { shortenAddress } from "@/lib/utils"; // Assuming a utility function exists

export function ConnectWalletButton() {
  const { address, isConnected } = useAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()

  if (isConnected) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm font-mono hidden sm:inline">{shortenAddress(address)}</span>
        <Button variant="outline" size="sm" onClick={() => disconnect()}>Disconnect</Button>
      </div>
    )
  }
  return (
    <Button size="sm" onClick={() => connect({ connector: injected() })}>
      Connect Wallet
    </Button>
  )
} 