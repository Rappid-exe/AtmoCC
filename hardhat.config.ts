import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

// Import PolkaVM specific plugins (as per documentation)
require('hardhat-resolc');
require('hardhat-revive-node');

// Load environment variables from .env file
dotenv.config();

// Ensure the private key is loaded
const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) {
  console.warn("PRIVATE_KEY environment variable not set. Deployment functionality will be limited.");
  // Optionally throw an error if deployment requires it: throw new Error("Missing PRIVATE_KEY");
}

const config: HardhatUserConfig = {
  solidity: "0.8.28", // Match the pragma in the contract
  networks: {
    // Configuration for Westend Asset Hub testnet (following documentation)
    westendAssetHub: {
      polkavm: true, // Added as per documentation
      url: "https://westend-asset-hub-eth-rpc.polkadot.io",
      // Use an array for accounts to avoid type errors if privateKey is undefined
      accounts: privateKey ? [privateKey] : [], 
      // chainId: 420420421 // Removed as per documentation (may conflict with polkavm:true)
    } as any, // Cast to any to allow polkavm property without TS error
    // You can add other networks here (e.g., localhost for testing)
    hardhat: {
      // Default network for local testing
    }
  },
  // Optional: Add Etherscan configuration for contract verification
  // etherscan: {
  //   apiKey: process.env.ETHERSCAN_API_KEY
  // }
  resolc: {
    compilerSource: 'binary', // Tells it to use a local binary
    settings: {
      optimizer: {
        enabled: true,
        runs: 400,
      },
      evmVersion: 'istanbul',
      compilerPath: 'C:/Users/user/Downloads/resolc-x86_64-pc-windows-msvc.exe', // Use the Windows binary
      standardJson: true,
    },
  },
} as any; // Cast the whole config to 'any' to allow plugin-specific properties

export default config;
