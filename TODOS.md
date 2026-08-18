# TODOS

## ZuGov / Union communities follow-ups (from 2026-08-18 eng review)

### Events (one-time/recurring) as a first-class concept

**What:** Communities can organize events (one-time or recurring). Only the structural constraint is captured here — no entity built yet.

**Why:** Named during the union-communities architecture review as part of why community structure needs to be built right, but has no concrete requirements yet to design against.

**Context:** Whoever picks this up must anchor events to `communities.id` the same way `parentCommunityId` and `unionMemberships` already do — never to a `maciGovernanceConfigs` field. This is the one hard constraint the review locked in: events (like unions and parent/child) live at the identity/structural layer, independent of whichever governance tool (MACI today) a community has configured.

**Effort:** Unscoped — no entity design exists yet
**Priority:** P3
**Depends on:** Identity/governance table split (this review) landing first

### Nested `{ identity, governance }` API response shape

**What:** Expose the `communities`/`maciGovernanceConfigs` split explicitly in API responses, instead of the flat-merged shape (+ `governanceConfigured` flag) locked in this review's Issue 3.

**Why:** More honest about the actual data model, and becomes actually useful once — if ever — a second governance backend exists and "flat merge" stops being a clean 1:1 join.

**Context:** Deliberately deferred because it would force every frontend read site (community detail page, manage-communities, GovernanceActionsList, JoinSection) to change for what is otherwise a purely internal storage refactor. Only revisit if a second governance backend actually gets built — until then this is speculative.

**Effort:** M (touches every frontend community-read call site)
**Priority:** P3
**Depends on:** A second governance backend existing (currently: none)

### Union browse-all page + leave-union flow

**What:** A page to browse all unions (not just the ones a given community belongs to), and a way for a member community to leave a union it already joined.

**Why:** The structural-core scope shipped in this review covers create/invite/accept/decline and a per-community "Unions" section, but not discovery or exit.

**Context:** Leave-union is the higher-priority half of this — once a community accepts a union invite, there is no way back out except a direct DB edit. That's a real gap, not just a nice-to-have, even though it's deferred out of the initial pass. The browse-all page is lower priority (discovery, not correctness).

**Effort:** S (leave flow — mirrors respond()'s existing state-machine) / M (browse page — new page type)
**Priority:** P2 (leave flow) / P3 (browse page)
**Depends on:** Union communities structural core (this review) landing first

## ZuGov / Lightpaper alignment

### Build the Contribution layer (badges, credentials, peer endorsement)

**What:** The Lightpaper's second layer — verifiable credentials/badges for contributions (organizing an event, writing code, hosting a session) that feed into a resident's standing in a community, plus peer-endorsement flows to issue them. Nothing in `zugov-backend`'s schema or `zugov-frontend` today models a "contribution" or "credential" as a first-class object — `membershipTiers` is a static role a wallet is assigned to, not something earned through activity.

**Why:** Identified during a wizard-vs-lightpaper comparison (2026-08-18): the current MVP ships the Community layer (this session's parent-child work) and a thin slice of the Voice layer (MACI voting), but the Contribution layer — the mechanism that's supposed to make voice/role earned rather than assigned — doesn't exist yet.

**Context:** Out of scope for Zukas 2026 (Sept 9-20, 2026); the event needs sybil-resistant polling and resident onboarding, not a full contribution economy. Revisit once the communities-first foundation (this session's work) is live and there's a real backlog of contributions to credential.

**Effort:** XL (new data model, credential issuance flow, likely a verifiable-credentials or EAS integration)
**Priority:** P3
**Depends on:** None architecturally, but sequenced after the Community layer (done) since contribution credentials need to attach to something

### Voice weighted by reputation/contribution, with role decay

**What:** The Lightpaper describes voting power that scales with contribution/reputation (not flat one-wallet-one-vote or purely tier-assigned) and roles that decay over time without continued participation — so influence reflects ongoing engagement, not a one-time grant.

**Why:** Today, `membershipTiers` grants fixed, non-decaying permissions (`canVote`, `canCreateGovernanceActions`, etc.) set once at tier assignment. MACI's quadratic/weighted voting modes exist at the protocol level (`supportedModes`), but nothing computes a reputation-derived voice-credit amount — `initialVoiceCreditAmount` is a static per-community constant, not derived from a resident's contribution history.

**Context:** Depends on the Contribution layer above existing first (decay/weighting needs something to decay/weight against). Flagged in the same 2026-08-18 lightpaper comparison.

**Effort:** L
**Priority:** P3
**Depends on:** Contribution layer (badges/credentials) above

### Coordination/federation layer across communities

**What:** The Lightpaper's fourth layer — cross-community coordination: shared proposals, resource pooling, or delegated representation between a parent community and its sub-communities (or between peer communities), beyond simple hierarchical nesting.

**Why:** This session added structural parent-child nesting (a `parentCommunityId` column and sub-community listing), which covers "communities and sub-communities as first-class components" but not the coordination mechanics on top — a parent community currently has no way to act on behalf of, aggregate votes from, or coordinate a joint decision with its children.

**Context:** The nesting primitive is a prerequisite for this and now exists. Federation mechanics are a much larger design question (delegation rules, cross-community quorum, conflicting membership) that needs its own design pass, not an MVP add-on.

**Effort:** XL
**Priority:** P3
**Depends on:** Communities/sub-communities nesting (done, 2026-08-18)

## Repo Infrastructure

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
