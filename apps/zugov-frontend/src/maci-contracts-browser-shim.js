// Browser-safe replacement for @maci-protocol/contracts.
// The real package index pulls in hardhat + native .node binaries that cannot
// run in the browser. This shim provides everything the browser SDK needs.

// ABI factories — typechain-types is pure ESM-compatible, no hardhat
export * from "../node_modules/@maci-protocol/contracts/build/typechain-types/index.js";

// Enums re-exported from the contracts package ts/index (CJS).
// We import them here so Vite bundles them as ESM named exports.
export {
  EMode,
  EPolicies,
  EContracts,
  EInitialVoiceCreditProxies,
} from "../node_modules/@maci-protocol/contracts/build/ts/index.js";

// genEmptyBallotRoots — uses @maci-protocol/core and domainobjs only, no hardhat
export { generateEmptyBallotRoots as genEmptyBallotRoots } from "../node_modules/@maci-protocol/contracts/build/ts/generateEmptyBallotRoots.js";

// genMaciStateFromContract — uses typechain-types + core, no hardhat
export { generateMaciStateFromContract as genMaciStateFromContract } from "../node_modules/@maci-protocol/contracts/build/ts/generateMaciState.js";

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
