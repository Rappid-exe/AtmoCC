from flask import Flask, request, jsonify
from flask_cors import CORS # Import CORS
import datetime
from web3 import Web3
import json
import os
from dotenv import load_dotenv

load_dotenv() # Load variables from .env file in the carbonAPI directory

app = Flask(__name__)
CORS(app) # Enable CORS for all origins by default

# Define the unique identifiers for the simulated systems
VALID_IDENTIFIERS = {
    "AC:XX0001": {"name": "System Alpha", "capture_rate_per_second": 0.015}, # Example rate 1
    "AC:XX0002": {"name": "System Beta", "capture_rate_per_second": 0.021},  # Example rate 2
    "AC:XX0003": {"name": "System Gamma", "capture_rate_per_second": 0.009}  # Example rate 3
}

# Simple simulation logic (placeholder)
# Assume a constant capture rate for now, same for all systems
CARBON_CAPTURE_RATE_PER_SECOND = 0.01 # Example rate in arbitrary units per second

def calculate_units(start_time, end_time, rate):
    """Calculates captured units using the provided rate."""
    duration_seconds = (end_time - start_time).total_seconds()
    if duration_seconds < 0:
        duration_seconds = 0 # Avoid negative units if clock changes etc.
    return duration_seconds * rate

# Updated route to include the system identifier
@app.route('/carbon/<identifier>/units', methods=['GET'])
def get_carbon_units(identifier):
    """API endpoint to get simulated carbon units for a specific system."""
    system_info = VALID_IDENTIFIERS.get(identifier)
    if not system_info:
        return jsonify({"error": f"Invalid system identifier: {identifier}"}), 404

    # Get the specific rate for this identifier
    capture_rate = system_info.get("capture_rate_per_second")
    if capture_rate is None: # Should not happen if config is correct
        return jsonify({"error": f"Configuration error: Missing capture rate for {identifier}"}), 500

    period = request.args.get('period', 'day').lower() # Default to day, handle case
    now = datetime.datetime.now(datetime.timezone.utc)

    try:
        if period == 'day':
            start_time = now.replace(hour=0, minute=0, second=0, microsecond=0)
        elif period == 'week':
            start_time = now - datetime.timedelta(days=now.weekday())
            start_time = start_time.replace(hour=0, minute=0, second=0, microsecond=0)
        elif period == 'month':
            start_time = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        else:
            return jsonify({"error": "Invalid period specified. Use 'day', 'week', or 'month'."}), 400

        units = calculate_units(start_time, now, capture_rate)

        return jsonify({
            "system_identifier": identifier,
            "system_name": system_info.get("name", "N/A"), # Include system name if available
            "period_type": period,
            "calculation_start_time": start_time.isoformat(),
            "calculation_end_time": now.isoformat(),
            "simulated_carbon_units": round(units, 6)
        })

    except Exception as e:
        return jsonify({"error": f"An internal error occurred: {str(e)}"}), 500

# --- Web3 Configuration ---
WESTEND_ASSET_HUB_RPC = 'https://westend-asset-hub-eth-rpc.polkadot.io'
CONTRACT_ADDRESS = '0x906781a08765C862Ba6D6bB0baF29679bd33216F' # Minimized contract address
DESIGNATED_RECIPIENT = '0xF9755E5682fd9492A7ee19d852a8d6e6661C7663' # Hardcoded recipient
OWNER_PRIVATE_KEY = os.getenv('OWNER_PRIVATE_KEY')

# Load Contract ABI (assuming it's copied to the same directory or an abi subfolder)
ABI_PATH = os.path.join(os.path.dirname(__file__), 'abi/CarbonCreditTokenMinimized.json') 
# Fallback path if not in abi subdir
if not os.path.exists(ABI_PATH):
    ABI_PATH = os.path.join(os.path.dirname(__file__), 'CarbonCreditTokenMinimized.json')

try:
    with open(ABI_PATH, 'r') as f:
        CONTRACT_ABI = json.load(f)
except FileNotFoundError:
    print(f"ERROR: ABI file not found at {ABI_PATH} or ./CarbonCreditTokenMinimized.json")
    CONTRACT_ABI = None # Handle missing ABI later
except json.JSONDecodeError:
    print(f"ERROR: Could not decode ABI file at {ABI_PATH}")
    CONTRACT_ABI = None

if not OWNER_PRIVATE_KEY:
    print("ERROR: OWNER_PRIVATE_KEY not found in carbonAPI/.env file!")

# Connect to Web3 Provider
w3 = Web3(Web3.HTTPProvider(WESTEND_ASSET_HUB_RPC))

if w3.is_connected():
    print(f"Connected to Web3 Provider: {WESTEND_ASSET_HUB_RPC}")
    try:
        # Ensure the private key starts with 0x
        if not OWNER_PRIVATE_KEY:
            print("ERROR: OWNER_PRIVATE_KEY is not set, cannot load owner account.")
            owner_account = None
        elif not OWNER_PRIVATE_KEY.startswith('0x'):
             owner_account = w3.eth.account.from_key('0x' + OWNER_PRIVATE_KEY)
             print(f"Loaded owner account: {owner_account.address}")
        else:
             owner_account = w3.eth.account.from_key(OWNER_PRIVATE_KEY)
             print(f"Loaded owner account: {owner_account.address}")
    except Exception as e:
        print(f"ERROR loading owner account from private key: {e}")
        owner_account = None
else:
    print(f"ERROR: Failed to connect to Web3 Provider: {WESTEND_ASSET_HUB_RPC}")
    owner_account = None

# --- NEW Backend Minting Route --- 
@app.route('/api/mint-credits-backend', methods=['POST'])
def mint_credits_backend():
    """Endpoint to trigger minting by the backend server using owner key."""
    if not CONTRACT_ABI or not owner_account:
        return jsonify({"error": "Backend configuration error (ABI/Owner Key)"}), 500
    if not w3.is_connected():
        return jsonify({"error": "Backend unable to connect to blockchain node"}), 500

    data = request.get_json()
    if not data:
        return jsonify({"error": "Missing request body"}), 400

    amount_to_mint_display = data.get('amount') # Amount in human-readable format (e.g., 100)
    # Optional: Get system ID if frontend sends it
    system_id = data.get('systemId', 'PurchaseFlow') # Default if not provided

    if amount_to_mint_display is None or not isinstance(amount_to_mint_display, (int, float)) or amount_to_mint_display <= 0:
        return jsonify({"error": "Invalid or missing 'amount' in request body"}), 400

    try:
        # 1. Convert display amount to base units (assuming 18 decimals)
        # TODO: Consider fetching decimals dynamically if needed
        decimals = 18 
        amount_base_units = w3.to_wei(amount_to_mint_display, 'ether') # Assuming 18 decimals like Ether
        print(f"Received mint request for {amount_to_mint_display} tokens -> {amount_base_units} base units")

        # 2. Get contract instance
        contract = w3.eth.contract(address=CONTRACT_ADDRESS, abi=CONTRACT_ABI)

        # 3. Build Transaction
        nonce = w3.eth.get_transaction_count(owner_account.address)
        tx_data = {
            'from': owner_account.address,
            'nonce': nonce,
            # Add gas/gasPrice if needed, web3.py often estimates but explicit can be better
            # 'gas': 2000000, 
            # 'gasPrice': w3.to_wei('50', 'gwei') 
        }

        # Estimate gas (optional but recommended)
        try:
             estimated_gas = contract.functions.mint(DESIGNATED_RECIPIENT, amount_base_units, system_id).estimate_gas(tx_data)
             tx_data['gas'] = estimated_gas + 30000 # Add buffer
             print(f"Estimated Gas: {estimated_gas}")
        except Exception as estimate_err:
             print(f"WARN: Gas estimation failed: {estimate_err}. Proceeding without explicit gas limit.")


        mint_tx = contract.functions.mint(
            DESIGNATED_RECIPIENT,
            amount_base_units,
            system_id
        ).build_transaction(tx_data)

        # 4. Sign Transaction
        signed_tx = w3.eth.account.sign_transaction(mint_tx, private_key=OWNER_PRIVATE_KEY)
        print("Transaction signed.")

        # 5. Send Transaction
        tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
        print(f"Transaction sent: {tx_hash.hex()}")

        # 6. Wait for Receipt (Optional but good for confirmation)
        print("Waiting for transaction receipt...")
        tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120) # Wait up to 120 seconds
        print(f"Transaction confirmed. Status: {tx_receipt.status}")

        if tx_receipt.status == 1:
            return jsonify({
                "success": True,
                "message": f"Successfully minted {amount_to_mint_display} tokens to {DESIGNATED_RECIPIENT}",
                "txHash": tx_hash.hex(),
                "blockNumber": tx_receipt.blockNumber,
                "systemId": system_id
            }), 200
        else:
             return jsonify({"error": "Blockchain transaction failed", "txHash": tx_hash.hex()}), 500

    except Exception as e:
        print(f"ERROR during minting transaction: {e}")
        return jsonify({"error": f"An internal error occurred during minting: {str(e)}"}), 500

if __name__ == '__main__':
    print("Starting Carbon Capture Simulator API on http://127.0.0.1:5001")
    print(f"Simulating systems: {list(VALID_IDENTIFIERS.keys())}")
    app.run(debug=True, port=5001, host='0.0.0.0') 