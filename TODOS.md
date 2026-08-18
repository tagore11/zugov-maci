# TODOS

## Repo Infrastructure

### Fix zugov-backend's engines field (">=22") to match repo-wide Node 20 standard

**What:** `apps/zugov-backend/package.json` declares `"engines": {"node": ">=22"}`, which contradicts the root's `"node": "20"` pin and every CI workflow (20+ files, including `deploy-backend.yml`), all of which run Node 20.

**Why:** This is almost certainly a stray/incorrect declaration, not an intentional decision — the backend already deploys successfully on Node 20 in CI. Investigated during the zukas2026 branch work when a pre-commit hook (husky, running a repo-wide `pnpm install` + Nx type-check) failed under Node 20 because of this mismatch, requiring a local Node 20/pnpm 10 shim workaround to commit.

**Context:** Considered bumping the whole repo to Node 22/pnpm 11 instead (to match what's actually available in some dev environments), but rejected: would mean updating 20+ CI workflow files, likely triggering a `pnpm-lock.yaml` format migration (currently `lockfileVersion: '9.0'`), and diverging from what's actually deployed to production today. The narrow fix (correct zugov-backend's own field) is smaller and safer. Deferred until the broader system re-architecture lands, per founder's call — not blocking Zukas 2026.

**Effort:** XS (one-line fix, once prioritized)
**Priority:** P3
**Depends on:** None

### Manually fund each resident's embedded wallet with Sepolia test ETH

**What:** After a resident signs up via email (Privy auto-provisions an embedded wallet), the wallet has 0 Sepolia ETH and cannot sign any transaction (MACI signup, voting). Tarik/Sait need to manually send test ETH to each resident's wallet address (visible in the Privy dashboard or via the app) before that resident can actually participate.

**Why:** No auto-funding path exists anywhere in the codebase (`src/config.ts` only lists manual faucet _links_ — Google Cloud Web3 Faucet, QuickNode, etc. — not an automated flow). Discovered during eng review's outside-voice pass, alongside the `window.ethereum` signer bug it's adjacent to (fixed separately).

**Context:** Given the small expected headcount for Zukas 2026 and Sepolia's free public faucets, this is an operational workaround, not a blocker — but it's a real step that must actually happen for each resident, and it's easy to forget under event-day pressure. Consider batch-funding all registered residents' addresses in one pass right before the event rather than one-by-one reactively.

**Effort:** S (operational, not engineering)
**Priority:** P1
**Depends on:** None — but blocks any embedded-wallet resident from actually signing up/voting until done

### Deploy MerkleProof policy factory to Sepolia

**What:** `policyFactories.merkleProof.policy` and `.checker` in `apps/zugov-frontend/src/generated/sepolia.ts` are both `0x0000...0000`. Deploy the MerkleProofPolicy factory (contract already exists at `packages/contracts/tasks/deploy/maci/01-policies.ts:535-589`) to Sepolia, then regenerate `sepolia.ts` via `syncFrontendConfig.ts`.

**Why:** Without this, `deployPolicyContract()` throws "Policy factories for MerkleProof are not deployed on this network" the moment anyone tries to use it — blocking real on-chain sybil-resistant poll eligibility beyond the default FreeForAll.

**Context:** Deferred out of the Zukas 2026 (Sept 9-20, 2026) MVP after eng review found it needs its own bootstrap step (a required, non-optional `root` field in `deploy-config.json` before the factory can even come up), not the "thin wiring" originally assumed. Founder decided the communities-first wizard redesign and wallet custody are higher priority for the live event; Zukas 2026 ships with backend-only (app-layer) eligibility gating via `checkVoteEligibility()` in `governanceActionService.ts`, on-chain policy stays FreeForAll. Revisit once the wizard/wallet work lands.

**Effort:** M
**Priority:** P2
**Depends on:** None (independent of wizard/wallet work, but explicitly deprioritized behind it)

### Build Merkle allowlist tooling (root + per-resident proof generation)

**What:** New zugov-backend endpoint(s): given a community's approved `memberships` list, generate a Merkle root (at poll creation) and serve each resident their individual proof (at vote time), using the already-existing `generateMerkleTree()` helper in `packages/contracts/ts/utils.ts:157` (returns an OpenZeppelin `StandardMerkleTree` — same primitive the upstream MACI test suite uses in `MerkleProofPolicy.test.ts`).

**Why:** `CreateProposalModal.tsx`'s MerkleProof input is currently a raw hex text box — no way for a non-technical poll creator to generate a root from a resident list, and no way for residents to get their own voting proof. Without this, MerkleProof stays unusable through the app even after the policy factory is deployed.

**Context:** Also need to document the "allowlist locks at poll creation" rule found during test review — a resident approved into the community after a poll's root is already deployed on-chain will have a proof that doesn't verify against the stale root. That needs to be a clear, non-silent error, not just a test.

**Effort:** S (thin wiring around an existing utility, not new cryptography)
**Priority:** P2
**Depends on:** Deploy MerkleProof policy factory to Sepolia (above)

### Dedupe checkVoteEligibility()'s two DB round-trips

**What:** `checkVoteEligibility()` in `governanceActionService.ts:363-380` calls `hasTierPermission()` then separately `getMemberTier()` — two round trips to the same `memberships` ⋈ `membershipTiers` join for the same wallet/community pair. Combine into one query returning both the permission flag and tier ID.

**Why:** Not a real N+1 (no loop over N rows) and low-impact at Zukas's scale, but it's a duplicate query on a hot path (every vote-eligibility check), and it's exactly the kind of thing that compounds once ZuGov has more than one small pilot community.

**Context:** Flagged in eng review's Performance section; founder deferred rather than fix inline to keep the reviewed diff tight to the Merkle/wizard/wallet work.

**Effort:** S
**Priority:** P3
**Depends on:** None

### Full responsive/mobile-layout redesign for CreateCommunityWizard

**What:** Intentional mobile layouts (not just "stacked on mobile") for every wizard step, including the new communities-first flow (role selection, Advanced settings accordion, plain-language review screen).

**Why:** The Sept 9 design review specified only a minimum bar (keyboard nav, 44px touch targets, contrast) — full mobile behavior is untested and unspecified.

**Context:** Deferred because Zukas 2026 community setup is organizer-facing and desktop-likely; residents interacting with polls (not community creation) are a separate, already-scoped flow. Revisit if mobile usage data from the live event shows real friction.

**Effort:** M
**Priority:** P3
**Depends on:** Communities-first wizard redesign landing first

### Full accessibility audit for CreateCommunityWizard

**What:** Screen reader testing, ARIA landmarks, and full a11y pass beyond the minimum bar (keyboard nav, touch targets, contrast) specified in the Sept 9 design review.

**Why:** Minimum bar covers immediate risk for the live event; a real audit (not just spot-checks) is separate, valuable work.

**Context:** Surfaced in plan-design-review Pass 6. No accessibility testing has been done on any part of zugov-frontend to date.

**Effort:** M
**Priority:** P3
**Depends on:** None

### Investigate passkey/smart-contract-wallet auth as a Privy replacement

**What:** Replace Privy's custodial-ish embedded wallet with a genuinely vendor-free path: WebAuthn passkeys signing through a smart contract wallet (ERC-4337 account abstraction + ERC-1271 signature verification), instead of a standard EOA/SIWE flow.

**Why:** Privy (and every embedded-wallet SDK evaluated — Dynamic, Web3Auth, Magic) means real vendor lock-in. Passkeys are the only path that avoids a wallet-infrastructure vendor entirely, and fit ZuGov's own values (minimizing trusted third parties) better than any custodial/MPC SaaS option.

**Context:** Researched during T1 (2026-08-18) and explicitly rejected for Sept 9 because it's the heaviest option, not the lightest: (1) WebAuthn uses secp256r1, Ethereum uses secp256k1 — mathematically incompatible, so this REQUIRES a smart contract wallet, not a simple key swap. (2) P-256 verification costs ~330k-400k gas without the RIP-7212 precompile (~$25/signature at L1 prices); RIP-7212 is deployed on major L2s but its status on plain Ethereum Sepolia (the chain locked in for Zukas 2026) is unconfirmed — check this first before any implementation attempt. (3) Requires an ERC-4337 bundler — either self-hosted (real new production infrastructure, arguably bigger than the MACI coordinator ops work) or a commercial bundler (Alchemy, Pimlico, Biconomy, ZeroDev, etc.) — which is still a vendor, just one layer lower. (4) `useSiwe.ts` and backend `auth.ts`/`session.ts` assume standard EOA `personal_sign` verification; a smart contract wallet needs ERC-1271 verification instead — real rework, not a provider swap. Worth revisiting once there's time to do it properly, not under event-deadline pressure.

**Effort:** XL
**Priority:** P3
**Depends on:** Confirming RIP-7212 precompile availability on the target chain (or moving to an L2 where it's confirmed live)
