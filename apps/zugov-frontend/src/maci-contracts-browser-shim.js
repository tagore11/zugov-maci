// Browser-safe replacement for @maci-protocol/contracts.
// Only provides what the browser SDK actually needs at runtime.
// Enums and server-side utilities are intentionally omitted.

// contractExists and currentBlockTimestamp — inlined to avoid contracts/ts/utils.js
// which has a dynamic require("hardhat")
export const contractExists = async (provider, address) => {
  const code = await provider.getCode(address);
  return code.length > 2;
};

export const currentBlockTimestamp = async (provider) => {
  const blockNum = await provider.getBlockNumber();
  const block = await provider.getBlock(blockNum);
  return Number(block?.timestamp);
};
