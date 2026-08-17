const appName = "ZUGOV";
const purpose = "This signature will be used to generate your secure MACI private key.";
export const SIGNATURE_MESSAGE = `Welcome to ${appName}! ${purpose}`;

// Platform constant for v1: every community this app deploys uses this MACI state tree depth.
// Not user-configurable — the coordinator only holds proving zkeys for depth 10 (see
// specs/001-create-community/research.md, decision R-004). Communities registered from an
// externally-deployed MACI contract may have a different depth (6 or 14 are also supported by
// the on-chain VerifyingKeysRegistry) — see useMaciContractConfig.ts's SUPPORTED_STATE_TREE_DEPTHS.
export const STATE_TREE_DEPTH = 10 as const;
