# TODOS

## ZuGov / Governance restructure Phase 3+ follow-ups (from 2026-08-20 Phase 2 implementation)

### Tally pipeline integration test coverage

**What:** `tallyService.ts`'s `triggerTally`/`runTallyInBackground` have zero integration test coverage anywhere in the repo — pre-existing, not introduced by Phase 2. Phase 2 added direct unit coverage for the pure `resolveElectionWinner` function (the only new logic in the pipeline) but didn't build the coordinator-mocking harness (`vi.mock` on `coordinatorClient.ts`'s HTTP calls, a real `maciGovernanceConfigs` test row) needed to exercise `runTallyInBackground` end to end — no existing test file does this for any tally-related behavior, so it would be new test infrastructure, not an extension of an existing pattern.

**Why:** The Phase 2 eng review's Test Review diagram flagged "non-person-type → electedWalletAddress stays null" and "tally fails → electedWalletAddress untouched" as regression-check gaps. Both turned out to be structurally guaranteed by the actual code (a ternary short-circuit for the first, the field being absent from the failure-path `.set()` call for the second) rather than genuine runtime risk — but that's true by code-reading, not by a test that would catch it if someone later changed the code and broke the guarantee.

**Effort:** M (building the coordinator-mock + governance-config test harness is the real cost; the assertions themselves are simple once it exists)
**Priority:** P2
**Depends on:** None

### ~~Confirm MACI's `FULL` mode real semantics~~ — RESOLVED (2026-08-20 Phase 2 `/plan-eng-review`)

**Resolution:** Confirmed by reading `packages/core/ts/Poll.ts:349-473` directly. `EMode.FULL` is a genuine, distinct 4th voting protocol type, not a substrate/circuit detail: on each message, it resets every OTHER vote option's ballot weight to zero and assigns the full new weight to only the selected option (`Poll.ts:395-399`), and requires the voter to spend their entire remaining voice-credit balance in that single message — any leftover credits throw `InvalidVoiceCredits` (`Poll.ts:377-379`). Credit-cost math is linear (non-quadratic), same formula as `NON_QV`/`RANKED` (`Poll.ts:466-472`). In plain terms: "single-choice, mandatory full-commitment" voting — not a refund mechanism as originally speculated. Belongs in `votingProtocolType` as a real, distinct value; `decisionAdapterService.ts`'s MACI capability declaration should be updated to include it (Phase 2 plan, T2, Architecture Finding 5, not yet implemented).

**Depends on:** None

### Unified decision-adapter execution interface

**What:** Phase 1's `decisionAdapterService.ts` is a backend capability registry only (which eligibility mechanisms an adapter supports, which decision-taking mechanisms/voting protocol types it offers) — the actual deploy/vote/tally execution stays adapter-specific frontend code (MACI's existing `useDeployPoll`/`useVote`/`useJoinPoll` hooks, refactored to read capabilities from the registry but not unified). Once a second adapter exists (Zupoll-style survey is the likely first), design a real shared execution interface across adapters.

**Why:** Founder's explicit call during the 2026-08-20 governance-restructure review — designing a unified interface against only one real implementation (MACI) risks getting the shape wrong; better to validate against two.

**Effort:** L
**Priority:** P2
**Depends on:** Phase 1 (decision-adapter registry) landing first; at least one non-MACI adapter existing to design against

### Zupoll-style survey decision adapter

**What:** Off-chain, Semaphore-group-proof survey/advisory-vote adapter, matching `julianapeace-zupoll`'s real `Ballot`/`Poll`/`Vote` model (`STRAWPOLL`/`ADVISORYVOTE` ballot types). Fills the "survey" decision-taking mechanism the governance-terminology glossary locked but Phase 1 doesn't build.

**Why:** Confirmed real, planned decision adapter during the 2026-08-20 governance-terminology review, grounded in the actual knowledge-base repo.

**Effort:** L
**Priority:** P2
**Depends on:** Decision-adapter architecture (Phase 1) landing first

### Snapshot-style voting decision adapter

**What:** Off-chain, public, signed-message voting adapter — matches the dominant real-world DAO tool (~96% of major DAOs). Would bring genuine "voting strategy" plurality (token-balance, NFT, delegation-based, mixable) into ZuGov, since Snapshot's own architecture cleanly separates voting _type_ (ballot format) from voting _strategy_ (weight computation) — the same split this glossary locked.

**Why:** Researched during the 2026-08-20 governance-terminology review; strongest real-world precedent for the off-chain/public substrate combination.

**Effort:** L
**Priority:** P2
**Depends on:** Decision-adapter architecture (Phase 1) landing first

### Tally/Governor-style voting decision adapter

**What:** On-chain, public, token-weighted (ERC20Votes) voting adapter with binding timelock execution — matches OpenZeppelin Governor / Tally. Realizes the already-stubbed-but-dead `MECHANISM_FAMILIES: "tokenWeighted"` wizard option for real.

**Why:** Researched during the 2026-08-20 governance-terminology review; direct precedent already half-named in the codebase.

**Effort:** L
**Priority:** P2
**Depends on:** Decision-adapter architecture (Phase 1) landing first

### Voting strategy (voter-power computation)

**What:** A new, currently-unmodeled concept: how much weight one voter's ballot carries — token-balance-based, NFT/credential-based, delegation-adjusted, uniform (today's implicit default), or a composed mix. Orthogonal to voting protocol type (ballot format). Matches Snapshot's real "strategies" concept exactly.

**Why:** Locked in the 2026-08-20 governance-terminology glossary as a real, distinct axis — not built in Phase 1, which only carries forward MACI's existing flat/uniform weighting unchanged.

**Effort:** L
**Priority:** P2
**Depends on:** Decision-adapter architecture (Phase 1) landing first; most naturally lands alongside a token-weighted adapter (Governor-style, above)

### Delegation (vote/survey participation-right assignment)

**What:** An eligible member assigns their voting/survey-participation right to another eligible member, scoped to one proposal or the whole community, revocable. Needs a real `delegations` table (delegator, delegate, scope, active/revoked) — today `canDelegate`/`canBeDelegatedTo` are declared tier flags with zero enforcement (`app/delegates/page.tsx` already says so explicitly).

**Why:** Explicit founder requirement during the 2026-08-20 governance-terminology review; must apply to both voting and survey, not just MACI-voting.

**Effort:** M
**Priority:** P2
**Depends on:** Proposal rename (Phase 1) landing first; **and, per the 2026-08-20 Phase 2 `/plan-eng-review`'s Architecture Finding 4, a real survey decision adapter (Zupoll-style) existing** — the "must apply to both voting and survey" requirement can't be honestly built while survey doesn't exist as a decision-taking mechanism at all. Building a voting-only version now would either leave the requirement unmet or force a re-scope once survey lands; deferred entirely rather than half-built.

### Decision target/type post-proposal enactment automation — person-type case IN PROGRESS (Phase 2)

**What:** Phase 1 adds a real `decisionTargetType` column (opinion/policy/person) to `proposals`, but doesn't build what happens after the decision is made. Phase 2 (2026-08-20 `/plan-eng-review`) scopes and builds the "person" case: `optionMemberAddresses` links each option to a real member, and tally completion resolves the winning option to `electedWalletAddress` (record + community-page badge only — no new on-chain write, no new roles/permissions system; see the "Elected-roles table with permissions" TODO below for that fuller version, deferred). "Policy" (apply/execute the decided rule) and "opinion" (needs no further action) stay unbuilt.

**Why:** This is where "election"/"referendum" get real operational meaning per the locked glossary (post-proposal action stage) — Phase 1 only added the classification, not the behavior it should drive.

**Effort:** M (person-type case, in progress) + M (policy-type case, still unscoped)
**Priority:** P2
**Depends on:** Proposal rename + decisionTargetType column (Phase 1) landing first

### Elected-roles table with permissions

**What:** A first-class "elected role" concept, separate from `membershipTiers`, giving a person-type proposal's winner real enforced standing (permissions, visibility) in the community — not just a recorded address. Likely shape: a new `electedRoles` table (`communityId` FK CASCADE, `proposalId` FK CASCADE, `walletAddress`, `grantedAt`), one row per proposal — not a mutation of `membershipTiers`.

**Why:** The fuller version of "register the elected person" that the original glossary wording implied. Phase 2 ships the minimal version (`proposals.electedWalletAddress` + a display badge) deliberately, since no product spec yet defines what an elected role should actually grant beyond a tier.

**Effort:** M
**Priority:** P3
**Depends on:** Phase 2's `electedWalletAddress` column landing first (gives it a real winner to grant the role to); a real product spec for what the role grants

### Member display-name system

**What:** `memberships` (`schema.ts`) has only `walletAddress` — no display name, ENS resolution, or nickname anywhere in the app. Every UI surface that shows a member today truncates the raw address.

**Why:** Surfaced by Phase 2's person-type enactment work (2026-08-20 `/plan-eng-review`, Architecture Finding 2) — the member picker and "Elected: 0x1234…abcd" badge both work fine with raw addresses, but this gap will keep resurfacing (delegate picker once delegation lands, elected-roles display, any future member-facing list). ENS resolution is a well-trodden, low-risk pattern (client-side, doesn't even require a schema change) but not every wallet has an ENS name; a self-set nickname needs a new column + edit UI. Deciding ENS-only vs. nickname vs. both needs a product call, not a code decision.

**Effort:** S (ENS-only) to M (nickname system)
**Priority:** P2
**Depends on:** None technically; wants a product decision on ENS vs. nickname vs. both before scoping

## ZuGov / Governance terminology follow-ups (from 2026-08-20 terminology review)

### Correct "Zupass" in the deferred eligibility adapters list — it's built, just disconnected

**What:** TODOS.md's own "8 deferred eligibility adapters" item lists Zupass as unbuilt. It isn't — `apps/zugov-backend/src/services/identity/zupassAdapter.ts` and `zkidAdapter.ts` are real, working `IdentityProvider` implementations, wired into `routes/credentials.ts`, storing verified/unverified/expired status in the `credentials` table. Neither is called by `eligibilityService.ts`. The fix is a thin `EligibilityAdapter.evaluate()` wrapper reading the already-cached `credentials` row (same shape as the existing `tier` adapter reading an already-stored membership row) — not new proof-verification work.

**Why:** Caught during the 2026-08-20 governance-terminology review while researching the knowledge-base's zupass/zkid repos. zkID isn't on the original deferred list at all.

**Effort:** S (wrapper adapters + list correction)
**Priority:** P2
**Depends on:** Eligibility adapters core (done, 2026-08-19)

### ~~Audit current in-repo MACI protocol state against ZuGov's app-layer assumptions~~ — RESOLVED (2026-08-20 Phase 2 `/plan-eng-review`)

**Resolution:** No bug. `packages/core/ts/utils/constants.ts:12-17` defines `EMode` with **4** values, not 3: `QV=0, NON_QV=1, FULL=2, RANKED=3`. `tallyService.ts`'s existing `VOTING_PROTOCOL_TYPE_TO_MODE` mapping (`{quadratic:0, simple:1, full:2, ranked:3, weighted:1}`) already matches this exactly — `"ranked" → 3` is a real, valid mode, not an out-of-range value. `"weighted"` has no distinct on-chain `EMode` counterpart at all (there is no `WEIGHTED` value in the enum), so aliasing it to `NON_QV` (mode `1`, same as `"simple"`) is an honest fallback, not a collision bug — "weighted" voting isn't a real MACI protocol concept yet, only an app-layer aspiration. `decisionAdapterService.ts`'s MACI capability declaration should be updated (Phase 2 plan, T2, Architecture Finding 5, not yet implemented) to include `"ranked"` and `"full"` as genuinely supported, with a comment explaining `"weighted"`'s alias status.

**Depends on:** None

### clr.fund-style decision adapter (funding allocation) — on-chain and off-chain/public variants

**What:** A decision adapter for the "funding allocation" decision target/type — quadratic funding distributing a shared matching pool across many proposals based on many small contributions, rather than a single yes/no or ranked choice on one proposal. Two variants: on-chain/privacy-preserving (composing MACI, matching the real clr.fund protocol), and an off-chain/public equivalent of the same mechanism.

**Why:** Confirmed as a real, planned decision adapter during the 2026-08-20 governance-terminology review — real-world precedent researched (clr.fund integrates MACI for anti-collusion in quadratic funding rounds).

**Effort:** L each variant (new decision-taking mechanism, not just a new adapter on an existing one)
**Priority:** P3
**Depends on:** Decision adapter architecture landing first (governance restructure, not yet built)

### Holographic Consensus-style decision adapter — on-chain and off-chain/public variants

**What:** A decision adapter combining token/reputation-weighted voting with a prediction-market-style "boosting" layer that filters which proposals get full-community attention vs. staying scoped to a smaller committee (DAOstack's Genesis Protocol model). Two variants: on-chain (matching the real DAOstack implementation), and an off-chain/public equivalent.

**Why:** Confirmed as a real, planned decision adapter during the 2026-08-20 governance-terminology review.

**Effort:** XL each variant (reputation system + prediction-market mechanics, exotic relative to anything else planned)
**Priority:** P3
**Depends on:** Decision adapter architecture landing first (governance restructure, not yet built)

### Document decision adapters as real repo documentation, not just a planning glossary

**What:** The decision-adapters table (MACI, Zupoll-style, Snapshot-style, Tally/Governor-style, clr.fund-style, Holographic-Consensus-style) currently only lives in a `/plan-eng-review`-adjacent glossary doc. Once the governance restructure locks an actual architecture, this belongs in the repo itself — an `ENGINEERING.md` section or a dedicated `docs/decision-adapters.md` — the same way `ENGINEERING.md` already documents the data model and core architectural principles.

**Why:** Explicit founder ask during the 2026-08-20 governance-terminology review.

**Effort:** S (once the architecture is locked — this is a docs task, not a design task)
**Priority:** P3
**Depends on:** Governance restructure `/plan-eng-review` landing first

## ZuGov / Eligibility adapters follow-ups (from 2026-08-19 `/plan-eng-review`)

### 8 deferred eligibility adapters (MerkleProof, EAS, GitcoinPassport, Zupass, Semaphore, AnonAadhaar, HatsProtocol, ERC20Votes)

**What:** The eligibility-adapters system shipped with exactly 3 adapters (Open, Tier, ERC20Token — chosen to prove off-chain/on-chain/hybrid-via-composition, not driven by current Sepolia deployment status). The other 8 MACI policy types each get their own adapter, one mechanism-registry entry + one Zod config schema branch each — additive once the core pattern exists, no changes needed to the evaluator itself.

**Why:** Full breadth wasn't needed to lock the core abstraction (adapter interface, DNF composition, rank-based tier resolution, enforcement call site) — each remaining adapter is small, isolated work once that foundation exists.

**Effort:** S each (one adapter + one schema branch)
**Priority:** P2
**Depends on:** Eligibility adapters core (done, 2026-08-19)

### Frontend eligibility-ruleset builder UI (creation-time + post-creation)

**What:** Backend ships `POST`/`GET /communities/:id/eligibility-ruleset` with zero resident-facing value until a UI exists — a creator needs to compose AND/OR groups, pick mechanisms, set per-group tier targets, at community creation OR later from the edit page. Same sequencing shape as the Events feature's own frontend follow-up.

**Why:** Dead API surface with no UI is worse than no API at all — flagged explicitly rather than left implicit.

**Effort:** M
**Priority:** P2
**Depends on:** Eligibility adapters core (done, 2026-08-19)

### Proof-based mechanism re-verification UX (Zupass/Semaphore/AnonAadhaar)

**What:** These mechanisms can't be silently re-checked by the system — eligibility requires the user to actively submit a fresh proof, unlike a token-balance check the system can re-verify passively at any time. Needs a real answer once these adapters ship: grace period? re-prove-on-next-visit prompt? something else?

**Why:** Flagged explicitly during the 2026-08-19 review as a genuinely different enforcement model from the 3 adapters that shipped — the adapter interface is shaped so it won't need to change later, but the actual UX is real, deferred work.

**Effort:** M
**Priority:** P3
**Depends on:** At least one proof-based adapter (above) shipping first

### Existing-member re-check sweep after a ruleset change

**What:** Today, a ruleset edit grandfathers every existing member indefinitely (2026-08-19 review, D3 — no resident should lose access from an admin's config edit they never saw happen). A later, explicit re-check mechanism (admin-triggered, or a scheduled sweep) that can flag members who'd now fail the current ruleset is real, deliberately deferred work.

**Why:** D3's grandfather behavior is permanent by default unless this lands — worth tracking so it doesn't quietly become "no admin can ever tighten eligibility and have it mean anything for existing members."

**Effort:** M
**Priority:** P3
**Depends on:** Eligibility adapters core (done, 2026-08-19)

### Flash-loan/flash-mint gaming risk on balance-snapshot adapters (ERC20Token, later ERC20Votes)

**What:** A point-in-time `balanceOf()` read (or, later, `ERC20Votes` snapshot) can be gamed with a flash loan/flash mint executed immediately before the eligibility check, then reversed. More consequential here than a one-time vote-weight snapshot elsewhere in the app, since this determines actual membership/tier grant, not just a single vote's weight.

**Why:** Caught during the 2026-08-19 eligibility-adapters review's outside-voice pass — accepted as a documented, not-solved risk for the initial pass (proper on-chain infrastructure hardening happens before public launch per the founder's own framing), but needs a real mitigation (minimum holding duration, block-delay, or a snapshot-based read) before any high-stakes production use.

**Effort:** M
**Priority:** P2
**Depends on:** None

### RPC caching/rate-limiting for union-eligibility ERC20 checks

**What:** The union eligibility fallback (`evaluateEligibilityAcrossUnion`, 2026-08-19 follow-up review) can trigger up to N sibling `evaluateRuleset` calls per join attempt, short-circuited on first pass but otherwise uncapped. Any sibling using the `erc20_token` mechanism does a live, serially-awaited on-chain `balanceOf()` read with no cache and no rate limit — repeatable by any wallet on every failed join attempt against a union community.

**Why:** Caught during that follow-up review's outside-voice pass. Accepted as a documented, not-solved risk for the initial pass — matches current scale (small unions, few ERC20-gated communities) — but a real cost once ERC20-gated unions grow. A short-lived balance cache (wallet+token+chain) or a join-attempt rate limit are the two obvious mitigations.

**Effort:** S–M (cache) or S (rate limit)
**Priority:** P3
**Depends on:** Union eligibility live-evaluation (this follow-up review's D1)

### Tier-adapter self-reference/cycle documentation

**What:** A group requiring "already holds Tier X" to unlock Tier X itself (or a two-group cycle) isn't detected anywhere today — it's a config-time footgun, not a crash (a self-referential rule is simply always false, fails closed). Worth real creator-facing documentation once the ruleset-builder UI exists.

**Why:** Flagged during the 2026-08-19 review's outside-voice pass; not blocking since it fails safely, but a creator hitting it with no explanation is a real, avoidable confusion.

**Effort:** S
**Priority:** P3
**Depends on:** Frontend eligibility-ruleset builder UI (above)

## ZuGov / Union communities follow-ups (from 2026-08-18 eng review)

### Events (one-time/recurring) as a first-class concept — backend implementation

**What:** Full schema + API locked by the 2026-08-19 `/plan-eng-review` (18 decisions, including an outside-voice pass): `events`, `venues`, `eventRsvps` tables anchored to `communities.id`, a new `canCreateEvents` tier permission, RSVP-only in v1 (check-in deferred to the Contribution layer TODO below), recurring events as independent rows sharing an optional `seriesId` (no RRULE engine), venue as its own reusable entity gated on `canManageMembership`, event edit/cancel as creator-OR-`canManageMembership` (not creator-only — the outside voice caught that the original creator-only design broke ENGINEERING.md's own "authorization is one reusable pattern" rule), a transactional `duplicate()` endpoint (capped at 52) plus a series-scoped bulk-cancel endpoint, and a paginated list endpoint matching `communities.ts`'s existing convention.

**Why:** No longer "unscoped" — this review fully designed it, including a cross-model outside-voice pass that caught 9 real gaps the interactive review alone missed (admin override, venue-creation permission, read-visibility, series lifecycle, batch-size cap, pagination, others noted in the review's findings).

**Context:** Backend-only. The outside voice flagged that Events is P3 while two P1/P2 items (wallet funding, MerkleProof factory deploy) directly block the live Sept 9 pilot, and this ships zero resident-facing value without a frontend pass — founder's explicit call was to proceed anyway as deliberate backend groundwork, with frontend tracked as its own separate TODO (below) rather than silently deferred.

**Effort:** L (3 new tables, ~11 routes, full test coverage per the review's test plan at `~/.gstack/projects/znurznurznur-maci/isasertkaya-main-eng-review-test-plan-20260819-081939.md`)
**Priority:** P3
**Depends on:** None — hard constraint (anchor to `communities.id`, never `maciGovernanceConfigs`) already satisfied by the identity/governance split, which has landed.

### Events frontend (calendar/list/create UI)

**What:** List view (grouped by date, not a calendar grid — see the follow-up item below), create/edit-event modal, RSVP toggle, venue picker — the UI layer for the Events backend above. Locked via a 2026-08-19 `/plan-design-review`: kind shows as a monochrome icon+label (not a colored badge — DESIGN.md's single-accent rule), no kind/date filters in v1 (deferred, small event counts don't need them yet), Edit reuses the create modal in a pre-filled/PATCH mode, Cancel/cancel-series use an inline "Are you sure? confirm" affordance rather than `window.confirm()` (matching this session's earlier wallet-sign-out fix), and the new modal gets Escape-key close + `role="dialog"`/`aria-modal` (no existing modal in this app has either — see the a11y follow-up item below).

**Why:** The backend ships with zero resident-facing value until this lands — flagged by the outside-voice pass during the 2026-08-19 eng review as a real sequencing gap, tracked explicitly rather than left implicit.

**Effort:** M (eventApi.ts, EventsSection.tsx, CreateEventModal.tsx, wired into the community detail page)
**Priority:** P2 (higher than the backend's own P3 once the backend actually ships — dead API surface with no UI is worse than no API at all)
**Depends on:** Events backend (above) landing first

### Events calendar grid view

**What:** A month/week calendar-grid view for Events, toggled from the list view — actual grid cells with day numbers, not just a chronological list grouped under date headers.

**Why:** TODOS.md's original item name was "calendar/list view," but the 2026-08-19 `/plan-design-review` scoped the first pass down to list-only — a real calendar grid is a materially bigger build (grid math, cell click targets, mobile grid collapse) with no existing grid-UI precedent anywhere in this app, and small pop-up-city event counts don't need it yet. Tracked explicitly so the "calendar" half of the original name isn't silently dropped.

**Effort:** L (new grid-layout component, month/week navigation, mobile collapse behavior — no reusable precedent in the codebase)
**Priority:** P3
**Depends on:** Events frontend (above) landing first

### Modal accessibility retrofit (Escape-key close + role="dialog")

**What:** Add Escape-key close and `role="dialog"`/`aria-modal="true"` to `CreateGovernanceActionModal` and `AuthModal` — the two existing modals in the app, neither of which has either today.

**Why:** Caught during the 2026-08-19 Events `/plan-design-review` (Pass 6, Responsive & Accessibility) while checking precedent for the new `CreateEventModal`. Keyboard-only and screen-reader users currently cannot close either existing modal without a mouse click on the X icon or the backdrop — a real accessibility gap, not cosmetic polish. The new Events modal gets both fixes as new code; this item is the retrofit for the two that predate it.

**Effort:** S (one small hook/utility shared across both modals — Escape listener + two ARIA attributes)
**Priority:** P3
**Depends on:** None

### Nested `{ identity, governance }` API response shape

**What:** Expose the `communities`/`maciGovernanceConfigs` split explicitly in API responses, instead of the flat-merged shape (+ `governanceConfigured` flag) locked in this review's Issue 3.

**Why:** More honest about the actual data model, and becomes actually useful once — if ever — a second governance backend exists and "flat merge" stops being a clean 1:1 join.

**Context:** Deliberately deferred because it would force every frontend read site (community detail page, manage-communities, GovernanceActionsList, JoinSection) to change for what is otherwise a purely internal storage refactor. Only revisit if a second governance backend actually gets built — until then this is speculative.

**Effort:** M (touches every frontend community-read call site)
**Priority:** P3
**Depends on:** A second governance backend existing (currently: none)

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

## ZuGov / Auth architecture follow-ups (from 2026-08-22 `/office-hours` + `/plan-eng-review`)

### ~~Roll out shared 401-detect wrapper to all write call sites~~ — RESOLVED (2026-08-23, Batches 1-4)

**What:** A `/plan-eng-review` pass (2026-08-23) audited every authenticated write call
site precisely, replacing this entry's old "~40 call sites" estimate: **31 real write
functions** across 6 service files, of which **21 have zero 401-handling** (2 more —
`eventApi.ts`'s `createVenue`/`cancelSeries` — turned out to be dead code, deleted in
Batch 1). Batch 1 (implemented this pass) covers `communityApi.ts`'s own internal
consistency (only 3 of its 8 writes auto-signed-out on a 401; now all 8 do, via the new
`withAuthDetect` wrapper in `src/services/httpClient.ts`) plus `membershipApi.ts`'s two
real landmines (`app/manage-communities/[id]/members/page.tsx`'s `handleApprove`/
`handleReject` had NO catch clause at all — worse than a swallow, a bare
`try {...} finally {...}` — now fixed).

**Batch 2 (implemented 2026-08-23) — DONE.** `membershipApi.ts`'s 3 remaining writes
(`createTier`, `updateTier`, `deleteTier`) plus `eligibilityApi.ts`'s `replaceRuleset`
(pulled forward from Batch 4) all get called from the same `edit/page.tsx`
`handleSubmit`, alongside `communityApi.update`'s edit-page call site — which turned
out to be a call site Batch 1's own audit had already flagged as inconsistent
(`communityApi.ts:200-218 update`'s TWO call sites: the wizard's, wrapped via
`withAuthRetry`; this edit page's, left on the old generic catch) but Batch 1's
Implementation Tasks never actually listed it, so it got missed. Fixed now: the whole
5-call save sequence (`update` → tier CRUD loop → `replaceRuleset`) is wrapped in ONE
`withAuthDetect` call, not one per call — they're one atomic "save" action from the
user's perspective, so a 401 anywhere in the sequence should sign out exactly once.

**Batch 3 (implemented 2026-08-23) — DONE.** `proposalApi.ts`'s 7 writes, across 2
call-site files: `CreateProposalModal.tsx` (`authorizeDirect`/`confirmDirect`/
`createDraft` — one atomic submit, one `withAuthDetect` wrap around the whole
`handleSubmit` body, matching Batch 2's edit-page precedent) and `ProposalsList.tsx`
(4 separate wraps in 3 components: `DeployPollPrompt.handleDeploy` for
`confirmFormalize`, `TallySection.handleTally` for `triggerTally`, and
`DraftRow`'s two independent handlers — `handleSponsor` for `sponsor` and
`runAuthorizeIfReady` for `authorizeFormalize` — kept as separate wraps since they're
two logically distinct actions with two distinct error-state variables, not one
sequence).

**Batch 4 (implemented 2026-08-23) — DONE.** `eventApi.ts`'s 6 live writes across 2
call-site files: `CreateEventModal.tsx` (`createEvent`/`updateEvent` — one atomic
submit, one `withAuthDetect` wrap around the whole `handleSubmit` body) and
`EventsSection.tsx` (3 separate wraps: `DuplicateForm.handleSubmit` for
`duplicateEvent`, `EventRow.handleRsvpToggle` for `rsvp`/`cancelRsvp` — one atomic
toggle, one wrap — and `EventRow.handleCancelConfirm` for `cancelEvent`). Plus
`credentialApi.ts`'s `verify`, wrapped inside `useCredentialScan.ts`'s `checkZupass` —
this file had its own hand-rolled duplicate of `parseErrorOr`'s logic (not one of the
original 4 counted in Batch 1's DRY extraction), migrated to the shared
`parseErrorOr`/`HttpError` in the same pass.

**Post-rollout re-verification (2026-08-23) caught one real miss:**
`app/community/[id]/JoinSection.tsx`'s two `membershipApi.join()` call sites
(`handleJoin`, `handleJoinBackendOnly`) were never wrapped in any of the 4 batches.
They already surfaced errors correctly (from an earlier, unrelated 2026-08-21 fix), so
Batch 1's audit didn't flag them as "swallowing" landmines — but nobody had gone back
to actually wire in the sign-out-on-401 behavior once `withAuthDetect` existed. Fixed:
both call sites now wrapped. This is exactly the same shape of miss as Batch 2's —
"already looks fine" is not the same check as "is it wrapped" — worth remembering for
any future rollout of this kind: audit for the wrapper's actual presence, not just for
whether the existing behavior already looks acceptable.

**Minor, non-blocking consistency gap found in the same re-verification:**
`communityApi.ts` never actually migrated to the shared `parseErrorOr` — its 8 write
functions still use bespoke inline `if (res.status === 401/403/409)` blocks (or the
file's own `handleCommunityResponse` helper) instead of the shared helper extracted in
Batch 1. Functionally harmless (`AuthError extends HttpError(401)` still makes
`isAuthError()`/`withAuthDetect()` work correctly), but it's the one file that never
got the DRY cleanup the other 5 did. Low priority — a pure refactor with no behavior
change, worth doing next time this file is touched for another reason, not on its own.

**All batches now complete, independently re-verified.** Every one of the 31 real
write functions (29 live + 2 confirmed-dead, deleted) across all 6 service files now
either already had 401-handling (the original 8 `communityApi.ts` functions) or has
`withAuthDetect` wired in. The "structural instead of opt-in" question (below) is the
only related work still open.

**Effort (actual, all batches + the post-rollout fix):** ~5 sessions, 1 new shared file
(`src/services/httpClient.ts`), ~20 files touched across service layer + call sites +
tests
**Priority:** was P1 (same root cause already produced 6 live bugs in one session
during pre-Zukas-2026 dogfooding)
**Depends on:** N/A — complete.

### Make 401-detection structural instead of opt-in (global interceptor)

**What:** `withAuthDetect` (Batch 1) is opt-in per call site — every write function's
call site must remember to wrap itself. Nothing structurally prevents a future write
function (in Batches 2-4, or any new endpoint added later) from being written without
it, reproducing the exact bug class this rollout exists to fix. Alternative: register a
global `signOut` callback once from `SiweProvider` (e.g. via a module-level mutable
reference set in a `useEffect`); the shared `parseErrorOr`/`HttpError` path in
`httpClient.ts` calls it automatically on any 401, with no per-call-site wrapping
required at all — every current AND future write gets 401-handling for free.

**Why:** Raised by this review's outside-voice pass (Claude subagent, Codex not
installed) as a genuine architecture gap in the opt-in design. Not built now because
this exact tradeoff (opt-in vs. a bigger consolidated mechanism) was already weighed
and decided at the parent SiweProvider `/plan-eng-review`: Approach B (a consolidated
API client with built-in 401-handling, zero-touch for future call sites) was rejected
in favor of Approach A (opt-in wrapper) because its bigger blast radius wasn't
justified by what was broken at the time. Revisiting it now, with the shared
`HttpError`/`parseErrorOr` foundation already in place from Batch 1, is a smaller
version of the same idea and may be worth it once Batches 2-4 reveal whether opt-in
wrapping keeps getting missed in practice.

**Open design question:** callback-registration timing — `SiweProvider` mounts once at
app root, but does the global callback exist before the very first API call fires after
app boot (e.g. a component's own `useEffect` firing before `SiweProvider`'s registration
effect)? Needs its own design pass, not a quick patch.

**Effort:** M (touches `SiweProvider` + `httpClient.ts`; needs a design pass for the
registration-timing question)
**Priority:** P2
**Depends on:** Batch 1 landing first (needs the shared `HttpError`/`parseErrorOr`
foundation to build on).

### ~~Unify Privy's wallet-connect signature and ZuGov's own SIWE signature~~ — RESOLVED (2026-08-23, Privy removed)

**Resolution:** Both candidate directions from the original write-up turned out to be
dead ends: Option A (bypass Privy's own wallet-auth signature, keep Privy only for
`embeddedWallets`) was blocked by `wagmiConfig.ts` importing `createConfig` from
`@privy-io/wagmi` — wagmi's connector state was entirely Privy-driven, with no
independent raw wagmi connector existing anywhere in the app, making "just bypass
Privy for external wallets" a real unknown-feasibility spike, not a simple change.
Option B (one signature satisfying both) was confirmed architecturally infeasible —
Privy's own "bring your own SIWE flow" API (`useLoginWithSiwe`/`generateSiweMessage`)
still requires PRIVY'S OWN generated message/nonce for its own replay protection, not
an arbitrary caller-supplied one.

Founder's call once both were ruled out: drop Privy entirely rather than find a third
option — "supporting both Privy and raw wagmi seems to be burdensome and causing
problems." A `/plan-eng-review` (2026-08-23) scoped and shipped the full removal:
plain wagmi `WagmiProvider` (a real registered `injected()` connector in
`wagmiConfig.ts`, replacing Privy's own wagmi bridge), `WalletConnectButton.tsx`
replacing `PrivyConnectButton.tsx`, `useSiwe.tsx`'s auto-sign-in effect no longer
gated on `usePrivy().authenticated` (nothing left to wait on). One signature now,
by construction — not two sequenced ones.

**Accepted tradeoff:** email/social sign-in and Privy's auto-provisioned embedded
wallet are gone with no in-house replacement yet — explicitly confirmed by the
founder ("wallet-only for now, accept the tradeoff") given the 401/403/route-guard
work this was bundled with needed a clean auth foundation before Zukas 2026. See
"Investigate passkey/smart-contract-wallet auth" below, now the only path back to
non-wallet-owning residents, and the now-obsolete embedded-wallet-funding TODO below.

**Depends on:** N/A — complete.

### Per-community configurable visibility policy (public vs. members-only)

**What:** Let each community choose what non-members can see — e.g. proposals/events
visible to everyone vs. members-only — as a real, per-community setting (a new field
on `communities`, checked at the route level per resource), not a single hardcoded
app-wide rule. Distinct from the 3-pattern gating-mechanism inconsistency (which page
uses SiweGate vs. wallet-only vs. no gating) — this is about what content is visible
at all, independent of which mechanism enforces it.

**Why:** Raised directly by the founder during the 2026-08-22 `/office-hours` premise
discussion — an explicit, different frame from "unify the auth mechanism," surfaced
mid-session and deliberately scoped out of the auth-unification wedge rather than
folded in silently.

**Effort:** M (schema field + per-resource route checks; UI for admins to set it)
**Priority:** P2
**Depends on:** Auth architecture unification (this pass + the 401-rollout TODO above)
landing first — a reliable "is this user authenticated" answer needs to exist before
building a visibility policy on top of it.

### Consolidate the 3 uncoordinated auth-gating patterns across pages (Phase B — scoped, not yet implemented)

**What:** Today, each page invents its own rule for "does this need auth to view/act":
`SiweGate`-wrapped (wizard, register, edit, community Join), wallet-address-only with
no SIWE check (`manage-profile`, `manage-communities` list), or a sub-pattern found
during the 2026-08-23 audit — components that call `useSiwe()` only reactively (for
`signOut()` cleanup after a 401), never proactively (never reading `isAuthenticated`
to gate rendering), which is functionally identical to "no gating" but easy to mistake
for real gating on a quick grep (`manage-communities/[id]/members` shows byte-identical
"You don't have permission" text for both a not-signed-in-at-all visitor and a
signed-in-but-unauthorized one). Other concrete offenders: `/community/:id`'s Join
button is `SiweGate`-wrapped in one governance-state branch but completely ungated in
the sibling branch; `/manage-communities/:id/edit`'s authorization gate is wallet-
address equality, not a SIWE check, and its "Save Changes" write bypasses `SiweGate`
entirely unlike its sibling register page.

A full route audit (all 14 routes in `src/App.tsx`) during the same `/plan-eng-review`
found no page actually needs its whole view blocked from an unauthenticated visitor —
the inconsistency is entirely action-level — but locked a `RequireAuth` route-guard
component anyway (react-router-dom v6 nested-route pattern), applied to exactly 2
routes with a genuine UX case for it: `/manage-communities` and `/manage-profile`
(both "your own stuff" pages that today show a misleadingly-empty view to a
disconnected visitor rather than a real sign-in prompt). Also locked: a symmetric
`isForbiddenError(err)` helper alongside the existing `isAuthError`/`withAuthDetect`
(`src/services/httpClient.ts`) for the 403-shaping half of this work (see the
"structural 401-detection" TODO above for the parallel 401 gap) — 403 status codes
are already correct everywhere on the backend (34 call sites), but response-SHAPING is
ad hoc (two idioms: inline `isAuthorized()`/`hasTierPermission()` + `c.json(...,403)`,
or catch-and-map custom error classes — no shared dispatcher like 401's `requireAuth`).

**Why:** Found during the 2026-08-22 auth audit; fully scoped during the 2026-08-23
Privy-removal `/plan-eng-review` (founder: "removing privy support needs to be full on
auth, 401, 403 handling, route guards and all, with unified gating") but deliberately
deferred as its own follow-up pass, not bundled into the Phase A Privy-removal commit.

**Effort:** M
**Priority:** P2
**Depends on:** Phase A (Privy removal, done 2026-08-23) landing first

### WalletConnect/mobile-wallet support

**What:** `wagmiConfig.ts` registers only a single `injected()` connector (auto-
discovers every EIP-6963 browser-extension wallet — MetaMask, Rabby, Coinbase
extension, etc. — under one entry), no `walletConnect()` connector for QR-code/mobile
wallet flows.

**Why:** Deliberately deferred during the 2026-08-23 Privy-removal `/plan-eng-review`
— adding it needs a new WalletConnect Cloud project ID, a new vendor dependency the
review didn't want to pull in in the same pass as the Privy removal it was meant to
simplify.

**Effort:** S (one new connector + a WalletConnect Cloud project ID)
**Priority:** P3
**Depends on:** None

### No rate limiting on `/api/auth/nonce` / `/api/auth/verify`; nonce not cleared on failed verify

**What:** Neither auth endpoint has rate limiting (confirmed: no rate-limit dependency
anywhere in `apps/zugov-backend`'s `package.json`). A failed `/api/auth/verify` doesn't
clear the session's nonce (only a successful verify does), so one session can throw
unlimited verify attempts at one nonce within its 5-minute TTL.

**Why:** Found during the 2026-08-22 auth audit. Not an authentication bypass (a valid
ECDSA signature is still required), but a real defense-in-depth gap.

**Effort:** S (a small rate-limit middleware; clearing the nonce on failure is a
one-line change to the `/verify` handler's failure path)
**Priority:** P3
**Depends on:** None

### `CORS_ORIGIN` missing env var crashes the backend at boot with a cryptic error

**What:** `apps/zugov-backend/src/app.ts`'s `process.env.CORS_ORIGIN!.split(",")` uses
a non-null assertion with no runtime guard — an unset/empty `CORS_ORIGIN` crashes the
whole backend at module load with "Cannot read properties of undefined (reading
'split')" instead of a clear, actionable error.

**Why:** Found during the 2026-08-22 auth audit. Contrast with the fail-loudly-with-
setup-instructions pattern this codebase otherwise favors for missing required config.

**Effort:** S (one explicit guard + error message, matching the frontend's pattern)
**Priority:** P3
**Depends on:** None

### Proposals are the only resource with auth-gated reads

**What:** Every route in `apps/zugov-backend/src/routes/proposals.ts` requires
`requireAuth`, including the two `GET` reads — the only resource in the backend where
reads require authentication. Every other resource (communities, events, venues,
eligibility rulesets, membership tiers, unions) has public `GET`s and auth-gated
writes only.

**Why:** Found during the 2026-08-22 auth audit. Unconfirmed whether this is
deliberate (proposal contents treated as sensitive) or an accidental over-restriction
— a logged-out visitor can browse a community's events and venues but can't view its
proposals at all, inconsistent with the rest of the app.

**Effort:** S (if a deliberate-intent confirmation says to open the reads up) to
unknown (if there's a real reason proposals need to stay gated, worth documenting why)
**Priority:** P3
**Depends on:** A product decision on whether proposal content should be public

## ZuGov / Member count consistency (found 2026-08-23 dogfooding)

### Communities show an incorrect/inconsistent member count

**What:** "Member count" is not one number in this codebase — it's at least 4 different
counters from 2 unrelated data sources, with nothing reconciling them:

1. What's actually displayed everywhere (community page, home page, manage-communities
   page) is `fetchMembers()` (`apps/zugov-frontend/src/services/subgraph.ts:120-127`),
   which queries the **on-chain MACI subgraph's `totalSignups`** — only wallets that
   completed the on-chain MACI signup transaction.
2. The Postgres `memberships` table (`apps/zugov-backend/src/db/schema.ts:205-214`) has
   no `status` column — every row counts. Exposed only via `GET /:id/members`
   (`membershipService.listMembers`), used solely for an election candidate picker,
   never rendered as a count anywhere.
3. A hardcoded `0` (`apps/zugov-frontend/src/lib/communityDisplay.ts:49`,
   `communityToItem`) shown before the subgraph query resolves, or for governance types
   the subgraph doesn't support.
4. `joinRequests` filtered to `status = "pending"` powers the "Pending Join Requests"
   count on `manage-communities/[id]/members/page.tsx` — easy to mistake for a member
   count (the page is literally named ".../members") but it's a request queue, not a
   roster; approved/rejected requests are invisible there.

The concrete divergence a user sees: `communityService.createIdentity`
(`apps/zugov-backend/src/services/communityService.ts:363-368`) always inserts the
creator into `memberships` at community-creation time, but the creator is never
auto-registered on-chain — so a brand-new community shows "0 members" (the on-chain
count everyone sees) even though the creator already "has membership" in the DB. Same
gap for anyone whose join request is approved (`approveRequest`,
`membershipService.ts:375-403`, DB-only) but who never separately completes
`JoinSection`'s on-chain MACI signup step — approved in the backend, invisible in the
number everyone else sees.

**Why:** Reported live during 2026-08-23 dogfooding. Root-caused via `/investigate` —
not a regression, this reflects the same identity/governance split already documented
in `ENGINEERING.md` ("on-chain state index is ground truth, the backend membership row
is secondary bookkeeping" — see also `JoinSection.tsx`'s own comments) — but nobody has
reconciled the _displayed count_ the two sides produce. A field-name collision makes it
worse: `unionService.listAll`'s `memberCount` (active `unionMemberships` rows) counts
**communities in a union**, not wallets in a community, yet unions and communities
render under the identical UI field `members` on the merged discovery/home page
(`communityDisplay.ts`'s `communityToItem`/`unionToItem`).

**Fix direction (not yet decided):** Two real options, deliberately not chosen yet:
(A) show the DB `memberships` count everywhere instead of on-chain `totalSignups` —
matches what "member" means everywhere else in the app (join requests, tiers,
permissions), shows a number immediately at creation; needs a new backend COUNT
endpoint plus swapping ~4 frontend call sites off `fetchMembers` for display purposes
(on-chain signup count likely still matters for voting-eligibility contexts,
just not as "member count"). (B) keep on-chain count as displayed, but auto-trigger
MACI signup whenever a DB membership is created — bigger change, adds a blockchain
transaction to the creation/approval flow, and doesn't fully close the gap for
communities without governance configured yet (identity can predate governance,
per `ENGINEERING.md`).

**Effort:** M (new backend query + ~4 frontend call-site swaps for option A; a
deploy-flow change touching creation/approval for option B)
**Priority:** P1 (a visibly wrong number on every community-facing page, live in
front of Zukas 2026 dogfooders)
**Depends on:** A decision between fix direction A vs. B — needs its own scoping
pass, not a blind pick

## ZuGov / Schema timestamp columns are Y2038-limited (found 2026-08-23 investigating event dates)

### Every `*At` timestamp column is a 32-bit Postgres `integer` — overflows in January 2038

**What:** While root-causing "event creation accepts garbage dates" (fixed: added a 5-year
sane-future bound to `createEventSchema`/`updateEventSchema` in
`apps/zugov-backend/src/routes/events.ts`), the regression test for the fix revealed the
_real_ failure mode underneath: before the bound existed, submitting a startAt corresponding
to year ~2126 didn't just get silently accepted — it crashed with a raw, unhandled 500 at
the DB layer. `apps/zugov-backend/src/db/schema.ts`'s `events.startAt`/`endAt`
(`integer("start_at")`) are Postgres 4-byte `integer` columns, max value 2,147,483,647 —
which corresponds to **2038-01-19T03:14:07Z**, the classic Unix Y2038 problem. Every other
timestamp column in the schema (`createdAt`, `joinedAt`, `expiresAt`, `sponsoredAt`,
`rsvpedAt`, `respondedAt`, and ~20 more — grep `integer(".*[Aa]t")` in schema.ts) uses the
same `integer` type; only `events.startAt`/`endAt` are user-controllable far enough into the
future to trigger it _today_ (everything else gets stamped with `Date.now()` at write time,
so it won't overflow until 2038 actually arrives — at which point every one of those columns
breaks app-wide simultaneously, not just events).

**Why:** The 5-year bound just added keeps `events.startAt`/`endAt` safely under the 2038
ceiling for the next several years (2026 + 5 = 2031), so this isn't an active production
outage — but it's a deliberate stopgap sitting on top of a real landmine, not a fix for it.
Two things make it worse than "years away, not urgent": (1) `duplicateEventSchema`
(`routes/events.ts`) has an unbounded `intervalDays` (`z.number().int().min(1)`, no max) —
`eventService.duplicate()` computes `source.startAt + intervalDays * 86400 * i` directly,
bypassing `createEventSchema`'s bound entirely, so a large `intervalDays` can still overflow
the column today, right now, via a second code path the events fix didn't touch. (2) A raw
500 (not a clean 4xx) on integer overflow means the failure mode is an unhandled exception,
not a validated rejection — the same shape of bug could resurface anywhere else a
user-controlled offset gets added to a stored timestamp.

**Fix direction (not scoped/decided):** Migrating all ~30 timestamp columns from `integer`
to `bigint` (or Postgres `timestamptz`, arguably the more correct type) is a real schema
migration — data migration for every existing row, Drizzle schema changes across every table,
and auditing every service that reads/writes these columns for narrowing assumptions. This is
architecture-review territory (`/plan-eng-review`), not a quick patch, and shouldn't be scoped
under time pressure. In the meantime, `duplicateEventSchema`'s `intervalDays` should get the
same kind of sane-bound treatment `createEventSchema` just got (small, targeted fix, unlike
the full migration).

**Effort:** S (bounding `intervalDays`, matching this session's events fix) now available as
a quick follow-up; L-XL (full `integer` → `bigint`/`timestamptz` migration across the schema)
for the real fix
**Priority:** P2 (not urgent — 2038 is ~12 years out and the immediate reported bug is fixed
— but a real ticking liability, and the `duplicateEventSchema` gap is exploitable today)
**Depends on:** None for the `intervalDays` bound; the full migration needs its own
`/plan-eng-review` given the blast radius across every table

## Repo Infrastructure

### ~~Manually fund each resident's embedded wallet with Sepolia test ETH~~ — OBSOLETE (2026-08-23, Privy removed)

**Resolution:** Moot. The premise was Privy auto-provisioning a zero-balance embedded
wallet for email sign-ups, which Tarik/Sait would then need to manually fund one by
one. Privy (and its embedded-wallet path) is gone as of the 2026-08-23 auth
`/plan-eng-review` — every resident now connects their own external wallet (MetaMask
etc.), which they're responsible for funding themselves (public Sepolia faucets are
still linked in `src/config.ts`). No more per-resident manual funding step for the
team to remember under event-day pressure — a positive side-effect of the removal,
not something that needs separate follow-up.

**Depends on:** N/A — obsolete.

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

### Investigate passkey/smart-contract-wallet auth for in-house email/passkey sign-in

**What:** A genuinely vendor-free path back to non-wallet-owning residents: WebAuthn
passkeys signing through a smart contract wallet (ERC-4337 account abstraction +
ERC-1271 signature verification), instead of a standard EOA/SIWE flow.

**Why:** Originally framed as "a Privy replacement" — now more directly load-bearing:
the 2026-08-23 Privy-removal `/plan-eng-review` dropped email/social sign-in entirely
(accepted tradeoff, "wallet-only for now"), with no in-house replacement built yet.
This is the only scoped path back to it. Passkeys also avoid a wallet-infrastructure
vendor entirely, fitting ZuGov's own values (minimizing trusted third parties) better
than any custodial/MPC SaaS option (Privy, Dynamic, Web3Auth, Magic) would have.

**Context:** Researched during T1 (2026-08-18) and explicitly rejected for Sept 9 because it's the heaviest option, not the lightest: (1) WebAuthn uses secp256r1, Ethereum uses secp256k1 — mathematically incompatible, so this REQUIRES a smart contract wallet, not a simple key swap. (2) P-256 verification costs ~330k-400k gas without the RIP-7212 precompile (~$25/signature at L1 prices); RIP-7212 is deployed on major L2s but its status on plain Ethereum Sepolia (the chain locked in for Zukas 2026) is unconfirmed — check this first before any implementation attempt. (3) Requires an ERC-4337 bundler — either self-hosted (real new production infrastructure, arguably bigger than the MACI coordinator ops work) or a commercial bundler (Alchemy, Pimlico, Biconomy, ZeroDev, etc.) — which is still a vendor, just one layer lower. (4) `useSiwe.ts` and backend `auth.ts`/`session.ts` assume standard EOA `personal_sign` verification; a smart contract wallet needs ERC-1271 verification instead — real rework, not a provider swap. Worth revisiting once there's time to do it properly, not under event-deadline pressure.

**Effort:** XL
**Priority:** P3
**Depends on:** Confirming RIP-7212 precompile availability on the target chain (or moving to an L2 where it's confirmed live)
