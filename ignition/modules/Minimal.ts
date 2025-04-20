import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const MinimalModule = buildModule("MinimalModule", (m) => {
  const minimal = m.contract("Minimal");
  return { minimal };
});

export default MinimalModule; 