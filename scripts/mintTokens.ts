import { ethers } from "hardhat";
import axios from "axios";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

// --- Configuration ---
const CARBON_API_BASE_URL = "http://127.0.0.1:5001"; // Your local API URL
const DEPLOYED_CONTRACT_ADDRESS = "0x906781a08765C862Ba6D6bB0baF29679bd33216F"; // New address for minimized contract
const CONTRACT_ABI = [ // New ABI for minimized contract
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "initialOwner",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "OwnableInvalidOwner",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "OwnableUnauthorizedAccount",
		"type": "error"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "account",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "systemId",
				"type": "string"
			}
		],
		"name": "CarbonCreditMinted",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "previousOwner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "OwnershipTransferred",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "Transfer",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "balanceOf",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "decimals",
		"outputs": [
			{
				"internalType": "uint8",
				"name": "",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "systemId",
				"type": "string"
			}
		],
		"name": "mint",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "name",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "renounceOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "symbol",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "totalSupply",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "transfer",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
]; // ABI from minimized contract deployment
const RECIPIENT_ADDRESS = "0xF9755E5682fd9492A7ee19d852a8d6e6661C7663"; // Address to receive the minted tokens
const SYSTEM_IDENTIFIER = "AC:XX0001"; // Which system to query from the API
const QUERY_PERIOD = "day"; // Or 'week', 'month'
// --- End Configuration ---

// Basic validation
if (!process.env.PRIVATE_KEY) {
    throw new Error("Missing PRIVATE_KEY in .env file");
}

async function mintCarbonCredits() {
    console.log(`Querying Carbon API (${CARBON_API_BASE_URL}) for system ${SYSTEM_IDENTIFIER} over period ${QUERY_PERIOD}...`);

    let simulatedUnits: number;
    let systemIdentifier: string;
    let roundedUnits: number;

    try {
        const response = await axios.get(
            `${CARBON_API_BASE_URL}/carbon/${SYSTEM_IDENTIFIER}/units?period=${QUERY_PERIOD}`
        );
        simulatedUnits = response.data.simulated_carbon_units;
        systemIdentifier = response.data.system_identifier;
        console.log(`API Response: Received ${simulatedUnits} units for system ${systemIdentifier}.`);

        if (!simulatedUnits || simulatedUnits <= 0) {
            console.log("No positive units received from API. Nothing to mint.");
            return;
        }

        // --- Round the units to the nearest whole number ---
        roundedUnits = Math.round(simulatedUnits);
        console.log(`Rounded units to mint: ${roundedUnits}`);

    } catch (error: any) {
        console.error(`Error calling Carbon API: ${error.message}`);
        if (axios.isAxiosError(error) && error.response) {
             console.error("API Error Data:", error.response.data);
        }
        return; // Stop execution if API call fails
    }

    // --- Get Signer (Contract Owner) ---
    // We need to connect to the specified network (Westend Asset Hub) via Hardhat config
    // Ensure your hardhat.config.ts has the correct RPC URL for westendAssetHub
    const provider = ethers.provider; // Uses network from --network flag
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
    console.log(`Connected to network via provider. Using signer: ${signer.address}`);

    // Check if signer address is the owner (optional but good practice)
    // try {
    //    const contractForOwnerCheck = new ethers.Contract(DEPLOYED_CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    //    const owner = await contractForOwnerCheck.owner();
    //    if (owner.toLowerCase() !== signer.address.toLowerCase()) {
    //        console.warn(`WARNING: Signer address ${signer.address} does not match contract owner ${owner}. Minting will likely fail.`);
    //    }
    //} catch (err) {
    //    console.error("Could not verify contract owner:", err);
    //}

    // Create contract instance connected to the signer
    const carbonContract = new ethers.Contract(DEPLOYED_CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    console.log(`Created contract instance for CarbonCreditToken at ${DEPLOYED_CONTRACT_ADDRESS}`);

    // --- Unit Conversion (IMPORTANT!) ---
    // Convert the API's decimal units to the contract's integer units.
    // Standard ERC20 uses 18 decimals. Verify this matches your contract.
    const decimals = 18; // Assuming 18 decimals
    // Use the rounded integer value for conversion
    const amountToMint = ethers.parseUnits(roundedUnits.toString(), decimals);
    console.log(`Converted ${roundedUnits} rounded units to ${amountToMint.toString()} base units (using ${decimals} decimals).`);

    // --- Double Minting Prevention (PLACEHOLDER - Needs Implementation!) ---
    // This script currently lacks logic to prevent minting for the same period multiple times.
    // You MUST add a mechanism (e.g., storing last processed timestamp) to avoid this in a real system.
    console.warn("!!! WARNING: No double-minting prevention implemented! Running this script multiple times for the same period will mint duplicate tokens. !!!");


    // --- Call the Mint Function ---
    try {
        // Ensure recipient address is valid before sending transaction
        if (!ethers.isAddress(RECIPIENT_ADDRESS)) {
            throw new Error(`Invalid recipient address: ${RECIPIENT_ADDRESS}`);
        }
        if (!systemIdentifier) {
            throw new Error("System Identifier was not retrieved from API.");
        }

        console.log(`Attempting to mint ${amountToMint.toString()} tokens for system ${systemIdentifier} to recipient ${RECIPIENT_ADDRESS}...`);

        // Estimate gas (optional, but can help catch issues early)
        // try {
        //     const estimatedGas = await carbonContract.mint.estimateGas(RECIPIENT_ADDRESS, amountToMint);
        //     console.log(`Estimated gas: ${estimatedGas.toString()}`);
        // } catch (gasError: any) {
        //     console.error(`Gas estimation failed: ${gasError.message}`);
        //     // Potentially throw or return here if gas estimation fails
        // }

        // Send the transaction
        const tx = await carbonContract.mint(RECIPIENT_ADDRESS, amountToMint, systemIdentifier);
        console.log(`Mint transaction sent. Hash: ${tx.hash}`);
        console.log("Waiting for transaction confirmation...");

        // Wait for the transaction to be mined (e.g., 1 confirmation)
        const receipt = await tx.wait(1);

        if (receipt?.status === 1) {
            console.log(`Transaction confirmed successfully in block: ${receipt.blockNumber}`);
            console.log(`Successfully minted ${ethers.formatUnits(amountToMint, decimals)} tokens to ${RECIPIENT_ADDRESS}.`);
        } else {
            console.error(`Transaction failed! Receipt:`, receipt);
        }

    } catch (error: any) {
        console.error(`Error calling mint function: ${error.message}`);
        // Log more details if available (e.g., revert reason from error data)
         if (error.data) {
             console.error("Error data (might contain revert reason):", error.data);
         }
         if (error.reason) {
            console.error("Revert Reason:", error.reason);
         }
         if (error.transaction) {
            console.error("Failed Transaction details:", error.transaction);
         }
    }
}

// Execute the main function
mintCarbonCredits()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Script execution failed:", error);
        process.exit(1);
    }); 