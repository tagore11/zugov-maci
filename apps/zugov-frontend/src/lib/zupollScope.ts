import { keccak256, toBytes } from "viem";

// specs/013-zupoll-decision-adapter — MUST match apps/zugov-backend's
// zupollService.proposalScope() byte-for-byte. `generateProof`'s scope parameter silently hashes
// any non-numeric string internally via an algorithm @semaphore-protocol/proof does not expose
// publicly (confirmed empirically against the installed 4.14.3 build) — depending on that
// unexported internal to match would be fragile against version bumps, so both sides compute
// this standard, well-known BN254-scalar-field reduction independently instead. Passing a raw
// proposalId directly to `generateProof` (skipping this function) would silently produce a proof
// that never verifies against the backend's independently-computed expected scope.
const SNARK_SCALAR_FIELD = 21888242871839275222246405745257275088548364400416034343698204186575808495617n;

export function proposalScope(proposalId: string): string {
  const digest = keccak256(toBytes(proposalId));
  return (BigInt(digest) % SNARK_SCALAR_FIELD).toString();
}
