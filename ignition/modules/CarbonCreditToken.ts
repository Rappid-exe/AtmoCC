import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const CarbonCreditTokenModule = buildModule("CarbonCreditTokenModule", (m) => {
  // Get the deployer account (from the private key configured for the network)
  const initialOwner = m.getAccount(0);

  // Deploy the CarbonCreditToken contract, passing the deployer's address as the initialOwner
  const carbonCreditToken = m.contract("CarbonCreditToken", [initialOwner]);

  // Return the deployed contract instance future
  return { carbonCreditToken };
});

export default CarbonCreditTokenModule; 