# AtmoSieve Carbon Credits

**Short Summary (<150 chars):**

AtmoSieve tokenizes simulated carbon capture data into verifiable ACC tokens on Polkadot Asset Hub, demonstrating transparent carbon credit creation.

---

## Demo Video

[ **Placeholder for Demo Video Link/Embed** ]

*(**Required:** Include a video demonstrating the setup, running the API and frontend, navigating the dashboard, showing live data, initiating a purchase, showing backend logs, showing the transaction/token on a block explorer, and showing the certificate page).*

---

## Screenshots

[ **Placeholder for Key Screenshots (e.g., Dashboard Live Data, Purchase Page Token Info, Purchase Confirmation, Certificate Page) ** ]

---

## Full Description

### Problem

The traditional carbon credit market often struggles with transparency and verifiability. It can be difficult to track the provenance of credits, ensure they represent real carbon removal, and prevent issues like double-counting. This lack of trust hinders the effectiveness and scalability of carbon offsetting initiatives.

### Solution: AtmoSieve Approach

AtmoSieve provides a proof-of-concept system showcasing how blockchain can enhance the transparency and trustworthiness of carbon credit creation. The system features:

1.  **Simulated Carbon Capture:** A backend API (`carbonAPI`) simulates data output from multiple distinct carbon capture systems (System Alpha, Beta, Gamma).
2.  **On-Chain Tokenization:** A backend process, triggered by a purchase action on the frontend, uses a secure owner key to interact with a smart contract deployed on the Polkadot Asset Hub. It mints unique "AtmoSieve Carbon Credit" (ACC) tokens corresponding to the simulated captured amount.
3.  **Designated Recipient:** For this corporate showcase, minted tokens are sent to a pre-defined public address (`0xF9755E5682fd9492A7ee19d852a8d6e6661C7663`), abstracting the wallet interaction away from the purchasing user.
4.  **Frontend Dashboard:** A web interface allows users (e.g., corporate buyers) to monitor the simulated capture data from the API, view overall token information (total supply) fetched directly from the blockchain, and initiate the purchase/minting process.
5.  **Verifiable Certificate:** A simulated certificate page displays purchase details and references the designated blockchain recipient address, linking the offset action to the on-chain record.

This demonstrates how the immutable and public nature of the blockchain can provide a verifiable ledger for carbon credit generation, enhancing trust for buyers and stakeholders.

### Polkadot Integration

The `CarbonCreditToken` smart contract, which governs the ACC tokens, is deployed and operates on the **Westend Asset Hub**, a Polkadot system parachain. We leverage Asset Hub for:

*   **Efficient Asset Management:** Asset Hub is specifically designed for creating and managing assets (like our ACC tokens) within the Polkadot ecosystem.
*   **EVM Compatibility:** It provides an EVM-compatible environment, allowing us to write smart contracts in Solidity and use familiar Ethereum development tools (Remix, `web3.py`, `wagmi`/`viem`) for deployment and interaction via its public RPC endpoint.
*   **Transparency & Security:** Transactions (like token minting) are recorded on the Asset Hub's public ledger, providing an immutable and verifiable audit trail for carbon credit creation, secured by Polkadot's shared security model.

---

## Technical Description

### Technology Stack

*   **Smart Contract:**
    *   Language: Solidity (`^0.8.20`)
    *   Libraries: OpenZeppelin Contracts (`Ownable`)
    *   Deployment: Remix IDE to Westend Asset Hub
    *   Key File: `contracts/CarbonCreditToken.sol` (Minimized version)
*   **Backend API & Minting:**
    *   Language: Python 3
    *   Framework: Flask, Flask-CORS
    *   Web3 Interaction: `web3.py`
    *   Environment Variables: `python-dotenv`
    *   Key Files: `carbonAPI/app.py`, `carbonAPI/requirements.txt`, `carbonAPI/.env`
*   **Frontend:**
    *   Framework: Next.js (v14+ with App Router)
    *   Language: TypeScript
    *   Styling: Tailwind CSS, Shadcn UI
    *   Web3 Interaction (Read-only): `wagmi`, `viem`
    *   State Management: React Hooks (`useState`, `useEffect`, `useMemo`), `@tanstack/react-query` (via Wagmi)
    *   API Calls: `axios` (for dashboard data), `fetch` (for backend minting call)
    *   Key Files: `frontend/web3-carbon-credits-landing/`, `app/layout.tsx`, `app/dashboard/page.tsx`, `app/dashboard/purchase/page.tsx`, `components/`

### Polkadot Features Leveraged

*   **Polkadot Asset Hub (Westend):** The target deployment network, chosen for its specialization in asset management and lower transaction costs compared to mainnet, while still providing public verifiability.
*   **EVM Compatibility (via Frontier):** Allowed the use of standard Solidity contracts and Ethereum tooling for interacting with the Asset Hub's blockchain state via its exposed RPC endpoint.

---

## Features

*   **API Simulation:** Python Flask API simulates data from multiple carbon capture systems.
*   **Live Dashboard Monitoring:** Frontend dashboard fetches and displays live simulated data from the API.
*   **Blockchain Token Info:** Frontend purchase page displays real-time token information (Name, Symbol, Total Supply) fetched directly from the deployed smart contract on Westend Asset Hub using `wagmi`.
*   **Abstracted Purchase Flow:** Users initiate a "purchase" via the frontend.
*   **Backend Minting:** A backend API endpoint securely uses the contract owner's private key to mint the corresponding ACC tokens on-chain to a designated recipient address.
*   **On-Chain Verification:** Token minting events are recorded publicly on the Westend Asset Hub blockchain.
*   **Certificate Display:** Frontend shows a completion page with purchase details and the designated recipient address.

---

## Getting Started / Setup

### Prerequisites

*   Node.js (v18 or later recommended)
*   npm (usually comes with Node.js)
*   Python (v3.8 or later recommended)
*   pip (Python package installer)
*   Git

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd Atmosieve/AtmoPolka
```

### 2. Backend Setup (CarbonAPI & Minting)

```bash
# Navigate to the backend directory
cd carbonAPI

# Create a requirements file (if it doesn't exist)
# Ensure it contains: Flask, Flask-CORS, web3, python-dotenv
# Example requirements.txt:
# Flask>=2.0
# Flask-CORS>=3.0
# web3>=6.0
# python-dotenv>=0.20

# Install Python dependencies (preferably in a virtual environment)
pip install -r requirements.txt

# Copy the Contract ABI file
# Make sure 'CarbonCreditTokenMinimized.json' is in this directory
# OR create an 'abi' subdirectory and place it there: 'abi/CarbonCreditTokenMinimized.json'
cp ../../path/to/your/CarbonCreditTokenMinimized.json .
# OR mkdir abi && cp ../../path/to/your/CarbonCreditTokenMinimized.json abi/

# Create the environment file for the private key
# Create a file named '.env' in this 'carbonAPI' directory
# Add your contract owner private key (the one used to deploy in Remix):
# OWNER_PRIVATE_KEY=0xYourRemixDeployerPrivateKeyHere

# SECURITY WARNING:
# NEVER commit the .env file containing your private key to Git.
# Add 'carbonAPI/.env' to your main .gitignore file in the project root!
```

### 3. Frontend Setup

```bash
# Navigate to the frontend directory from the project root
cd ../frontend/web3-carbon-credits-landing

# Install Node.js dependencies (using --legacy-peer-deps for potential conflicts)
npm install --legacy-peer-deps
```

### 4. Running the Application

You need two terminals open.

**Terminal 1: Run Backend API Server**

```bash
# Navigate to the project root (Atmosieve/AtmoPolka)
cd ../..

# Run the Flask app as a module
python -m carbonAPI.app
```
*(Look for output indicating connection to Web3 provider and owner account loading).*

**Terminal 2: Run Frontend Development Server**

```bash
# Navigate to the frontend directory
cd frontend/web3-carbon-credits-landing

# Start the Next.js dev server
npm run dev
```
*(Wait for compilation to finish).*

Access the application in your browser, usually at `http://localhost:3000`. The API runs on `http://localhost:5001`.

---

## Usage

1.  Open `http://localhost:3000` in your browser.
2.  Navigate from the landing page to the Dashboard (`/dashboard`).
3.  Observe the "Live System Monitoring" cards fetching data from the local Carbon API.
4.  Navigate to the Purchase page (`/dashboard/purchase`).
5.  Observe the "Carbon Credit Token Status" card fetching live data (Name, Symbol, Total Supply) from the Westend Asset Hub. Note the Designated Recipient address.
6.  Select a purchase amount using the "Custom Amount" tab's slider/input.
7.  Click "Confirm Purchase". This sends a request to the local backend API.
8.  The backend API uses the owner's private key to mint tokens to the designated recipient on the blockchain. Observe the backend terminal logs.
9.  The frontend will show a success alert with the transaction hash.
10. You can verify the transaction and token balance change for the recipient on a Westend Asset Hub block explorer like Subscan using the transaction hash or recipient address.
11. *(Optional)* Navigate to the completion page (`/dashboard/purchase/complete`) to view the simulated certificate showing the designated recipient address.

---

## Presentation

[ **Placeholder for Link to Canva Presentation** ]

---

## License

[ **Placeholder: e.g., MIT License** ]

See the `LICENSE` file for details. *(Remember to add a LICENSE file to the repository)*

---

## Team / Contact

[ **Placeholder for Team Member Names/Contact Info** ]