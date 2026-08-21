# Engineering Architecture — ZuGov

Standing architecture reference, analogous to `DESIGN.md` for the design system — this
captures durable structural decisions and the current data model so they survive past any
single feature's planning doc. Feature-specific planning docs (e.g.
`docs/design/union-communities.md`) still exist for the detailed rationale/review trail behind
a given change; this file is where the decisions that should keep shaping _future_ work live on
after that change ships.

## System Context

- **Monorepo layout:** `apps/zugov-backend` (Hono + Drizzle ORM + Postgres), `apps/zugov-frontend`
  (React/Vite, react-router-dom, wagmi + Privy, TanStack Query), plus a subgraph package for
  per-community indexing.
- **Auth has two independent layers:**
  - **Privy** (client-side) — wallet connection. Supports both self-custody wallets (MetaMask
    etc.) and email sign-in, which auto-provisions an embedded/custodial wallet
    (`embeddedWallets.ethereum.createOnLogin: "users-without-wallets"` in `providers.tsx`) so
    residents without crypto experience never see a seed phrase.
  - **SIWE session** (server-side) — a separate httpOnly-cookie-backed session (`sessions`
    table), required for any authenticated write. `requireAuth` middleware enforces it;
    `getSession(c)` reads it where auth is optional. A connected Privy wallet does not imply an
    authenticated backend session — write flows gate on `SiweGate`/`useSiwe()` independently.

## Data Model (current)

```
communities (identity + structure)
  id                      text PK — UUID (wizard-created) or historical on-chain address
                          (manually-registered/legacy rows) — never assume a shape
  displayName / description? / logo?
  creatorAddress          text
  parentCommunityId       text? FK -> communities.id, ON DELETE SET NULL
  membershipPolicy        "open" | "approval"
  tierChangesRequireVote  boolean
  defaultTierId           text?
  cosponsorshipThreshold  integer
  directDeploymentEnabled boolean
  createdAt / registeredAt

maciGovernanceConfigs (governance layer, 1:1 with communities, ON DELETE CASCADE)
  communityId             text PK/FK -> communities.id
  contractAddress         text? — the real deployed MACI address; nullable until configured
  chainId, governanceType, allowedPolicies, supportedModes, signUpPolicyType,
  signUpPolicyAddress, stateTreeDepth, coordinatorPublicKey, tallyProcessingStateTreeDepth,
  voteOptionTreeDepth, messageBatchSize, freeForAllPolicyFactory, freeForAllChecker,
  constantVoiceCreditProxyFactory, initialVoiceCreditAmount, maciDeploymentBlock,
  subgraphName, subgraphStatus ("pending" | "ready" | "failed")

communityDecisionAdapters (governance layer, ON DELETE CASCADE)
  communityId FK -> communities.id, adapterType "maci" (only value today), attachedAt
  PK (communityId, adapterType) — a community's menu of attached decision adapters. Capability
  registry only (`decisionAdapterService.ts` declares which eligibility mechanisms and voting
  protocol types each `adapterType` supports); actual deploy/vote/tally execution stays
  adapter-specific frontend code, not unified here. See "Decision Adapters" below.

unions (peer/federation grouping — distinct from parentCommunityId's hierarchy)
  id text PK — always a server-generated UUID, never an address (unions are never
  on-chain deployed objects)
  displayName / description? / logo? / creatorAddress / createdAt

unionMemberships (many-to-many, communities <-> unions)
  unionId FK -> unions.id (CASCADE), communityId FK -> communities.id (CASCADE)
  status "pending" | "active" | "declined", invitedByAddress, requestedAt / respondedAt
  PK (unionId, communityId)

membershipTiers / memberships / joinRequests — per-community role and membership state
proposals / proposalSponsors (governance layer — decisions and their co-sponsorship;
  renamed from governanceActions/governanceActionSponsors, 2026-08-20 governance restructure
  Phase 1)
  votingProtocolType "simple" | "quadratic" | "ranked" | "weighted" | "full" — ballot format
    (renamed from tallyMechanism)
  decisionTargetType "opinion" | "policy" | "person" — what's being decided; drives
    post-proposal behavior. "person" (election) enactment resolves the tally's winning option
    to `electedWalletAddress` — direct-deploy creation path only, see Decisions Log.
    "policy"/"opinion" enactment behavior is still unbuilt (deferred, see TODOS.md).
  optionMemberAddresses text[]? / electedWalletAddress text? — "person"-type only; each
    option's candidate wallet address (same index as `options`), and the tally-resolved winner
    (null on a tie — never a guessed winner)
  decisionAdapterType "maci" | "zupoll" (default "maci") — explicit adapter dispatch, not
    inferred from (privacy, executionLocation, votingProtocolType)
  withdrawnAt integer? — generic across adapters; set once, never cleared. Zupoll only:
    withdrawable pre-vote, permanently locked once ≥1 vote exists (see zupollVotes below)
sessions / credentials — SIWE sessions and Zupass/zkID identity verification results
zupollIdentityCommitments / zupollProposalGroups / zupollVotes (Zupoll decision adapter,
  2026-08-21, specs/013-zupoll-decision-adapter) — off-chain, anonymous, Semaphore-group-proof
  survey voting.
  zupollIdentityCommitments: PK (walletAddress, communityId) — per-community, never global
    (prevents cross-community correlation via a shared commitment). Upserted on
    re-registration; no admin-assisted recovery path exists for a lost identity secret.
  zupollProposalGroups: PK proposalId — the historic eligible-voter Merkle-tree snapshot,
    taken once at proposal creation, never updated afterward.
  zupollVotes: no wallet/identity column and no FK to zupollIdentityCommitments at all — the
    anonymity boundary is enforced by the schema itself. UNIQUE (proposalId, nullifier) is the
    double-vote prevention mechanism.

venues (identity/structure layer, anchored to a community — not governance)
  id text PK, communityId FK -> communities.id (CASCADE), name, address?, mapUrl?, createdAt

events (identity/structure layer — never references maciGovernanceConfigs)
  id text PK, communityId FK -> communities.id (CASCADE)
  venueId FK -> venues.id (SET NULL) XOR locationText — exactly one, enforced at the
    validator, not the DB
  startAt / endAt (multi-day is computed from these, never stored), seriesId? (recurring
    events are independent rows sharing one seriesId, not an RRULE-expanded row)
  kind "talk"|"workshop"|"social"|"meeting"|"other", creatorAddress
  status "active"|"cancelled" + cancelledAt — soft-cancel, mirrors unionMemberships
  index on (communityId, startAt)

eventRsvps (RSVP is intent only — any signed-in wallet, no membership check)
  PK (eventId, walletAddress); status "active"|"cancelled" + cancelledAt — soft-cancel,
  cancel-then-re-RSVP flips the same row back to active rather than duplicating it
```

## Core Architectural Principles

These generalize beyond the feature that established them — apply them to new work, don't
just treat them as historical record:

- **Identity/governance separation.** A community's identity and structure (who it is, its
  membership policy, its tiers) can exist fully independent of whether any governance tool is
  configured. A new governance backend (non-MACI) should attach via its own pluggable config
  table mirroring `maciGovernanceConfigs`'s 1:1 shape — never bolt governance-specific columns
  onto `communities` directly.
- **`id` vs. `contractAddress` — never conflate them.** `communities.id` is an opaque primary
  key, not guaranteed to be an on-chain address. Every on-chain-interaction call site (contract
  reads/writes, subgraph deploy args, MACI factory connections) must read
  `governanceConfig.contractAddress`, gated on `governanceConfigured: true`.
- **Structural relationships never require governance.** `parentCommunityId` and union
  membership are available to any community identity, governed or not — governance is a
  strictly additive, later-attached layer on top of structure, not a prerequisite for it.
  Ungoverned communities stay visible in listings (`governanceConfigured: false`), not hidden.
- **Authorization is one reusable pattern.** `isAuthorized(communityId, wallet)` = creator
  address match OR a membership tier with the relevant permission flag
  (`canManageMembership`/`canVote`/`canCreateProposals`). Every new
  admin-gated mutation should reuse this shape rather than inventing a parallel check.
- **Consent-gating for cross-community mutations.** When one community's action affects
  another's standing (union invites), only the affected community's own admin can accept it —
  never the initiator. Rejections are revisitable (a later invite resets `declined` back to
  `pending`), not a permanent lock-out.
- **Flat, merged read shapes over nested ones.** API responses merge identity + governance into
  one flat object with a `governanceConfigured: boolean` flag, not a nested
  `{identity, governance}` shape — keeps frontend read sites simple; a nested shape is a
  deliberately deferred TODO, not an oversight.

## Decision Adapters

A community's governance is a menu of attached **decision adapters** (`communityDecisionAdapters`
table), not a single hardcoded backend — `governanceType` generalized into this table during the
2026-08-20 governance restructure (Phase 1). Each adapter type declares its own capabilities
(`decisionAdapterService.ts`'s `ADAPTER_CAPABILITIES`): which eligibility mechanisms it can
enforce, which voting protocol types it supports. Execution (deploy/vote/tally) stays
adapter-specific frontend code — no unified execution interface exists yet (deliberately
deferred until a 2nd real adapter exists to design against, see TODOS.md).

| Adapter                         | Substrate                                     | Status   | Notes                                                                                                                                                                                                                      |
| ------------------------------- | --------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **MACI**                        | On-chain, privacy-preserving                  | Shipped  | Supports `open`/`erc20_token` eligibility mechanisms; `simple`/`quadratic`/`ranked`/`full` voting protocol types (`weighted` has no true on-chain MACI mode, aliases to `simple`)                                          |
| **Zupoll-style**                | Off-chain, Semaphore-group-proof              | Shipped  | Fills the "survey" decision-taking mechanism — anonymous, single-question opinion polls, one question per proposal (no multi-question ballot bundling). See specs/013-zupoll-decision-adapter and the Decisions Log below. |
| **Snapshot-style**              | Off-chain, public, signed-message             | Deferred | Real "voting strategy" plurality (token-balance/NFT/delegation-based weighting) — not built yet                                                                                                                            |
| **Tally/Governor-style**        | On-chain, public, token-weighted (ERC20Votes) | Deferred | Binding timelock execution — not built yet                                                                                                                                                                                 |
| **clr.fund-style**              | On-chain or off-chain, quadratic funding      | Deferred | "Funding allocation" decision target — a new decision-taking mechanism, not just a new adapter                                                                                                                             |
| **Holographic Consensus-style** | On-chain or off-chain, boosted voting         | Deferred | Reputation-weighted + prediction-market boosting layer (DAOstack Genesis Protocol model)                                                                                                                                   |

## API Conventions

- REST endpoints under `/api/*`, one Hono router per resource area, request bodies validated
  with Zod schemas.
- Session auth via httpOnly cookie; `requireAuth` middleware for routes that must be
  authenticated, `getSession(c)` directly where auth is optional (e.g. public reads that
  personalize when a session exists).
- Route handlers call into a service-layer function for each mutation/query — routes stay thin
  (parse, authorize, delegate, map errors to status codes); business logic and DB access live in
  `src/services/*.ts`, never inline in route handlers.
- Authorization checks generally run before resource-existence checks (established precedent,
  e.g. `PATCH /communities/:id`) — a nonexistent resource usually surfaces as 403, not 404, for
  an unauthorized caller. This is intentional, matched precedent, not a bug — but it's a
  precedent, not an absolute rule: deviate when following it would produce an actively
  misleading response to a caller who _is_ otherwise authorized (see the union invite route's
  explicit 404-before-403 check for a caller with a real, authorized community but a
  nonexistent union).

## Frontend Architecture

- TanStack Query owns all server state; query keys are deliberately shared across components
  that read the same resource (e.g. `["community", id]` used by both the detail page and
  `ProposalsList`) so mounting both doesn't double-fetch — check for an existing query
  key before inventing a new one for data you're already fetching elsewhere.
- wagmi + Privy own wallet/auth state; `useCreateCommunity` orchestrates the multi-phase
  on-chain community deployment (sign-up policy → MACI → set target → attach governance) with a
  `localStorage` checkpoint so a page refresh mid-deployment can resume instead of restarting.

## Decisions Log

| Date       | Decision                                                                                                                                                                                                                                                                                                | Rationale                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-08-18 | Split `communities` into identity/structure vs. pluggable `maciGovernanceConfigs`                                                                                                                                                                                                                       | A community's identity should be able to exist before any governance tool is deployed/configured — enables the identity-first wizard flow and supports future non-MACI governance backends without touching the identity schema.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 2026-08-18 | `communities.id` no longer guaranteed to be a deployed contract address                                                                                                                                                                                                                                 | Wizard-created communities get a server-generated UUID at identity-creation time, before deployment starts. `maciGovernanceConfigs.contractAddress` (nullable) is the only field guaranteed to hold the real on-chain address.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| 2026-08-19 | `apps/coordinator` resolves its on-chain RPC endpoint per-chain (`ts/common/chain.ts`'s `getRpcUrl`), keyed by `ESupportedChains`, instead of one global `COORDINATOR_RPC_URL`                                                                                                                          | A single endpoint meant every merge/generate/submit request connected to the same chain regardless of which chain a community's MACI contract was actually deployed on — silently misrouting non-default-chain communities. Mirrors `apps/zugov-backend/src/services/chainRpc.ts`'s existing fail-closed, `chainId`-keyed convention; a chain with no configured endpoint now fails that request explicitly instead of falling back to another chain's. See `specs/009-coordinator-multi-chain-rpc/`.                                                                                                                                                                                                                                                                                                                                                                              |
| 2026-08-18 | Union communities: peer/federation relationship, consent-gated, distinct from `parentCommunityId`                                                                                                                                                                                                       | Two independent communities can federate without either governing the other. Invite requires `canManageMembership` on the inviting community; accept/decline requires the same on the invited community, never the inviter.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| 2026-08-18 | Structural relationships (parent/child, unions) never require governance to be configured                                                                                                                                                                                                               | An ungoverned community identity is still a full participant in the app's structural features — visible in listings, can found/join unions, can be a parent or child. Governance is strictly additive, never a structural prerequisite.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 2026-08-18 | Read API stays flat with a `governanceConfigured` flag, not a nested `{identity, governance}` shape                                                                                                                                                                                                     | No frontend read-site changes needed for the identity/governance split itself; a nested shape is logged as a deferred TODO, not built now.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 2026-08-19 | Events/venues/RSVPs live in the identity/structure layer, anchored to `communities.id`, never `maciGovernanceConfigs`                                                                                                                                                                                   | Matches the identity/governance separation principle — an ungoverned community can still host events. Validated against sola.day's own live product, which also has no governance coupling.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| 2026-08-19 | Recurring events are independent rows sharing a `seriesId`, not an RRULE-expanded single row                                                                                                                                                                                                            | "Boring by default" — sola.day's own API has no recurrence params either. `duplicate()` generates N rows in one DB transaction (capped at 52) so a mid-batch failure leaves zero rows persisted, not a partial series.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 2026-08-19 | Event edit/cancel/duplicate: creator OR `isAuthorized(communityId, wallet)`, not creator-only                                                                                                                                                                                                           | Outside-voice review finding — creator-only broke the "authorization is one reusable pattern" principle; `isAuthorized` already implements exactly this creator-OR-permission shape, so events reuse it rather than inventing a parallel check.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 2026-08-19 | RSVP is intent only, open to any signed-in wallet — no membership check                                                                                                                                                                                                                                 | Matches sola.day's own event/RSVP model; attendance/check-in is a separate, deliberately deferred TODO, not built now.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 2026-08-19 | New `canCreateEvents` tier permission (default `true`) gates event creation; venue creation stays on `canManageMembership`                                                                                                                                                                              | "Anyone can propose an event" is the default posture per the locked review, but venues (a shared physical resource) stay admin-gated — the two are deliberately different permission levels, not the same check reused twice.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 2026-08-20 | `governanceType` generalized into a real `communityDecisionAdapters` menu table; `governanceActions`/`governanceActionSponsors` renamed to `proposals`/`proposalSponsors`; `tallyMechanism` renamed to `votingProtocolType`; new `decisionTargetType` column added                                      | Governance restructure Phase 1 — formalizes the governance umbrella (proposal vs. decision target/type vs. decision-taking mechanism vs. voting protocol type vs. decision adapter) so a 2nd real decision adapter doesn't force a rename/migration later. Proposal creation now requires at least one decision adapter attached (`NoDecisionAdapterAttachedError`), wired through the one shared `attachGovernance()` path so every caller gets it for free.                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 2026-08-20 | Governance deployment removed from the create-community wizard's reachable state graph entirely; deploying governance is now exclusively an advanced setting on the community edit page                                                                                                                 | Governance restructure Phase 1, D2 — a literal deletion (`network_check`/`review`/`deploying` dropped from `WizardStep`), not just "unreachable." Some communities may permanently never attach governance and lose proposal-creation capability — an accepted tradeoff, not a bug.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 2026-08-20 | "Person"-type (election) enactment automation ships as record + display only — `electedWalletAddress` set from the tally's winning option, shown as a badge — not a new on-chain write or a new roles/permissions system; scoped to the direct-deployment proposal-creation path only                   | Governance restructure Phase 2 — a full on-chain registration needs a new contract write path (no new protocol integrations this phase); a real "elected role" needs a product spec that doesn't exist yet (deferred, see TODOS.md). Restricted to the direct-deploy path because the draft/co-sponsorship path collects proposal options later, at formalize time (`DeployPollPrompt.tsx`), with no validation hook for `optionMemberAddresses` today. No winner is recorded on a tie — an honest intermediate state, never a guessed one.                                                                                                                                                                                                                                                                                                                                        |
| 2026-08-21 | Zupoll adapter's anonymity is a real Semaphore group-membership commitment/nullifier scheme, structurally decoupled from wallet-authenticated SIWE sessions — not a reuse of the existing `IdentityProvider`/`credentials` pattern, and not "wallet-tied, UI-only" anonymity                            | `credentials` is keyed `(walletAddress, protocol)` and both existing adapters (zupass, zkid) bind their proof to the caller's wallet directly — reusing that pattern would silently defeat "the server never learns who voted." The vote-casting endpoint (`POST /api/proposals/:id/zupoll/vote`) is deliberately never wrapped in `requireAuth`: a session-gated vote route would let the server trivially correlate session→wallet with the vote regardless of how sound the underlying ZK proof is. New tables `zupollIdentityCommitments` (per-community, not global — prevents cross-community correlation), `zupollProposalGroups` (immutable per-proposal eligible-voter snapshot, taken once at creation), `zupollVotes` (structurally has no wallet/identity column at all — the anonymity boundary is enforced by the schema itself, not just service-layer discipline). |
| 2026-08-21 | Zupoll proposal tallies are hidden pre-vote via real server-side gating (the caller presents their own already-known vote nullifier to the tally endpoint), not a client-side-only `localStorage` convention                                                                                            | A nullifier carries no identity information back to the server, so this satisfies "hide tallies until voted" for real without reintroducing any wallet/session linkage — closes a gap an earlier draft of this feature's design left as client-side-only.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 2026-08-21 | Zupoll's Semaphore proof `scope` is `proposalId` reduced into the SNARK scalar field via a locally-implemented, standard `keccak256(...) mod BN254_SCALAR_FIELD` (`zupollService.proposalScope`) — not the raw `proposalId` string, and not `@semaphore-protocol/proof`'s internal (unexported) hashing | `generateProof`'s scope/message parameters silently hash any non-numeric string internally via an algorithm the package does not expose publicly — verified empirically against the installed 4.14.3 build. Depending on that unexported internal to replicate the transformation server-side would be fragile against version bumps; both client and server now compute the same well-known, public transformation independently instead. Both the frontend's proof-generation code and the backend's verification MUST call the identical function — passing a raw `proposalId` to `generateProof` would silently produce a proof that never verifies.                                                                                                                                                                                                                           |
