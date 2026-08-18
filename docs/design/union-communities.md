# Union Communities + Identity/Governance Split — Locked Architecture

Repo: znurznurznur/maci (zugov), branch zukas2026. Target: Zukas 2026 event (Sept 9-20, 2026).

## Context

Already shipped this session (uncommitted): parent/child community nesting
(`communities.parentCommunityId`, self-referencing FK, ON DELETE SET NULL,
symmetric to nothing — a child just exists under one parent).

This plan adds two things, decided via interactive eng review:

1. A physical split of the `communities` table into an identity/structure
   layer and a pluggable governance-config layer (MACI-specific today).
2. "Union communities" — a peer/federation relationship between fully
   independent communities, consent-gated, distinct from parent/child.

## Decisions locked (with rationale)

**1A/1B — Identity-first, id predates deployment.** `communities.id` becomes
a server-generated UUID at identity-creation time, no longer required to be
the deployed MACI contract address. A community's identity can now exist
before any governance/deployment decision. Existing rows keep their
historical address-shaped ids untouched (id is just an opaque text PK,
nothing requires a consistent shape across rows).

**1C — contractAddress threaded through 7 verified call sites** (outside-voice
review caught 3 more than the initial pass — reconcileCreatorAddress's
subgraph query and reconcileSignUpPolicy's on-chain read, the latter wrapped
in a blanket `catch { return community; }` that would silently and
permanently break signUpPolicyType backfill for every post-split community
if left unfixed; plus the `/subgraph/retry` route's independent call site).
Governance config gets a new nullable `contractAddress` field. All 7 sites
must be rewired to use `governanceConfig.contractAddress` instead of `id`:

- `apps/zugov-backend/src/services/communityService.ts:151` —
  `reconcileCreatorAddress`'s subgraph query, `maci(id: "${community.id...}")`
- `apps/zugov-backend/src/services/communityService.ts:189` —
  `reconcileSignUpPolicy`'s `readContract({ address: community.id as Address })`
  inside a silent `catch { return community; }`
- `apps/zugov-backend/src/routes/communities.ts:174` — `/subgraph/retry`'s
  independent `deployCommunitySubgraph(community.id, ...)` call
- `apps/zugov-frontend/app/community/[id]/JoinSection.tsx:40` —
  `MACI__factory.connect(communityId, provider)`
- `apps/zugov-frontend/app/community/[id]/JoinSection.tsx:50` —
  `await signupToMaci(communityId)`
- `apps/zugov-frontend/app/components/GovernanceActionsList.tsx:240,330` —
  `maciAddress={communityId}`
- `apps/zugov-backend/src/services/subgraphDeployService.ts:44-45` —
  `"--address", communityId` (passed to the subgraph deploy script)

**2 — Union invites: any active member with `canManageMembership`, not
founder-only, not "any membership row" either.** Outside-voice review caught
that the original "any active member" phrasing had no permission-tier gate —
inconsistent with every other structural mutation in this schema
(`tierChangesRequireVote`, `canManageMembership` on join-request approval).
Invite authorization checks the caller's tier has `canManageMembership:true`
on the inviting community, reusing the same flag already used for approving
join requests — not just "has any membership row."

**2b — Tier creation + creator enrollment happen in createIdentity(), not
attachGovernance().** Outside-voice review caught that the split never
specified where `createTiersForCommunity()` and the creator's own membership
enrollment move to. They stay at identity-creation time — a community's
membership/role structure is itself identity-layer (per Q1's original
ruling: "community joining" is core structural, not governance-tool-specific)
— so an ungoverned community's creator still has standing (and can act as
the `canManageMembership`-holding admin for Issue 2's invite gate) from the
moment identity is created, not only once governance is configured.

**3 — Read API stays flat + `governanceConfigured: boolean`.** No frontend
read-site changes needed for the split itself. A nested `{identity,
governance}` shape is logged as a future TODO, not built now.

**4 — Ungoverned communities are visible, not hidden.** They appear in list
results (`governanceConfigured: false`); the detail page shows a "governance
not yet configured" state (mirrors the existing `subgraphStatus: 'pending'`
pattern already on that page) instead of broken join/vote controls. Public
browse surfaces filter to `governanceConfigured: true` by default.

**5 — Union membership has no governance-status restriction.** Any
community identity — governed or not — can found or join a union.
Consistent with `parentCommunityId`, which has the same rule.

**6 — Declines are revisitable, not permanent.** A new invite() call on a
previously-declined membership resets it to pending.

## Data model

```
communities (identity + structure — SLIMMED)
  id                    text PK  — UUID (new rows) or historical address (old rows)
  displayName           text
  description           text?
  logo                  text?
  creatorAddress        text
  parentCommunityId     text?    FK -> communities.id, ON DELETE SET NULL
  membershipPolicy      "open"|"approval"
  tierChangesRequireVote boolean
  defaultTierId         text?
  cosponsorshipThreshold integer
  directDeploymentEnabled boolean
  createdAt / registeredAt integer

maciGovernanceConfigs (NEW — governance layer, 1:1 with communities)
  communityId           text PK/FK -> communities.id, ON DELETE CASCADE
  contractAddress        text?   — NEW, nullable until deployed
  chainId                integer
  governanceType          text (default "maci")
  allowedPolicies / supportedModes  text (JSON)
  signUpPolicyType / signUpPolicyAddress
  stateTreeDepth
  coordinatorPublicKey, tallyProcessingStateTreeDepth, voteOptionTreeDepth,
  messageBatchSize, freeForAllPolicyFactory, freeForAllChecker,
  constantVoiceCreditProxyFactory, initialVoiceCreditAmount
  maciDeploymentBlock
  subgraphName / subgraphStatus

unions (NEW)
  id              text PK — server-generated UUID (never an address; unions
                  are never on-chain deployed objects)
  displayName
  description?
  logo?
  creatorAddress  text  — wallet that created the union
  createdAt

unionMemberships (NEW — many-to-many, communities <-> unions)
  unionId          FK -> unions.id, ON DELETE CASCADE
  communityId      FK -> communities.id, ON DELETE CASCADE
  status           "pending" | "active" | "declined"
  invitedByAddress text
  requestedAt / respondedAt
  PK (unionId, communityId)
```

Migration: existing `communities` rows' governance columns move to
`maciGovernanceConfigs`, with `contractAddress` backfilled from the old
`id` value (historically id WAS the address for every existing row).

## API surface

```
POST   /api/communities                    identity-only now (displayName,
                                            description?, logo?, parentCommunityId?)
POST   /api/communities/:id/governance     attach governance config (401/403/404/409/201)
GET    /api/communities                    flat merged shape + governanceConfigured
GET    /api/communities/:id                same
GET    /api/communities/:id/children       [unchanged, already shipped]

POST   /api/unions                         create (founding community auto-active member)
POST   /api/unions/:id/invite              propose a community join (any active member)
POST   /api/unions/:id/respond             accept/decline (invited community's admin only)
GET    /api/unions/:id                     union + active members (+ pending if authorized)
GET    /api/communities/:id/unions         unions this community belongs to
```

## UI/UX plan (structural core, per earlier scope decision)

Calibrated against `DESIGN.md` (established 2026-08-18, mid-review — see
"Design review" section below for the full trail).

- Wizard: identity created at the community_info -> community_setup
  transition (id known immediately); governance attached during the
  existing `save_community` deploy phase, referencing that id.
- **Community detail page card order** (Design Issue 1, locked): Info card ->
  Governance status ("not yet configured" empty state, or the existing
  join/vote panels once configured) -> Sub-communities -> Unions ->
  Governance Actions/polls. Orient (identity, then whether governance works)
  before structure (sub-communities, owned) before alliances (unions, merely
  participated in) before activity (polls). The new "Unions" section mirrors
  the just-shipped "Sub-communities" section's card/mini-card pattern, but
  ranks below it in the page order.
- **Union invite/accept interaction states** (Design Issue 2, locked):
  - Loading: invite button shows an inline spinner, disabled during submit.
  - Pending: invited community shows in the Unions section with an
    "Invited — awaiting response" badge (`--color-text-secondary`, not an
    error/warning color — this is a normal, possibly multi-day state, not a
    problem).
  - Error 403 (not authorized): inline "You don't have permission to invite
    for this community," not a toast.
  - Error 404: not user-reachable in normal use (the invite picker only
    lists real communities) — treat as a bug if hit, no dedicated UI copy.
  - Error 409 (duplicate invite): "Already invited" — disables the invite
    action for that pair, does not let the user retry into the same error.
  - Success: invited community moves from the pending list to the active
    Unions list on both sides.
- **Design-token migration** (Design Issue 3, locked): the just-shipped
  Sub-communities section's `hover:border-purple-500` gets fixed to the new
  accent (`#648DAF` / `--color-accent`) in this same PR — it's the same file
  being touched for the new Unions section, and shipping the two sections
  with different accent colors on the same page would recreate the exact
  "two unreconciled themes" problem DESIGN.md was written to close.
- **Mobile scope** (Design Issue 4, locked): full responsive/a11y polish for
  the union UI follows the wizard's existing P3 deferral (TODOS.md,
  "organizer-facing, desktop-likely") — EXCEPT the invite accept/decline
  action specifically, which gets baseline mobile support now (44px touch
  targets, usable at 375px width), since responding to an invite is a
  notification-style action plausibly happening on a phone during the live
  event, unlike one-time desktop-likely community setup.
- New entry point (manage-communities page): "Create union" / "Invite to
  union" / pending-invites accept-decline list. Placement/structure within
  that page not yet decided — deferred to implementation, low-stakes (single
  existing page, not a new information architecture).
- No dedicated `/union/[id]` browse-all page in this pass (deferred).

## NOT in scope (deferred, logged as TODOs)

- Events (one-time/recurring) — noted as a structural constraint only
  (must anchor to community.id, independent of governance config).
- Nested `{identity, governance}` API response shape.
- Dedicated union browse-all page, leave-union flow.
- Union-of-unions (recursive membership).
- Contribution layer, reputation-weighted voice/decay, full
  coordination/federation mechanics beyond structural grouping — already
  logged as TODOs this session, union communities is explicitly their
  first structural slice.

## Risk this review flagged explicitly

The biggest risk is 1C: this touches 7 on-chain-interaction call sites (4
found in the initial pass, 3 more caught by outside-voice review) that
currently work and are tested (signup, vote/join-poll, subgraph indexing,
creator/sign-up-policy reconciliation). The plan requires new test coverage
for the `governanceConfigured: false` state in each of those flows, plus
regression tests confirming the `governanceConfigured: true` path is
byte-for-byte unchanged in behavior. `reconcileSignUpPolicy`'s existing
blanket `catch { return community; }` (communityService.ts:197-199) is the
single highest-risk spot — a bug there fails silently with no error visible
anywhere, not even in logs.

## Outside-voice review (Claude subagent, 2026-08-18)

Ran automatically per this skill's default-on outside-voice step (codex CLI
not installed, fell back to a Claude subagent in an isolated worktree). 5
findings: 1 false alarm (the subagent's isolated worktree couldn't see this
session's uncommitted parent/child work and mistakenly concluded it didn't
exist — confirmed via `git status`/`grep` against the real working tree, not
a defect in the plan), 4 real and all accepted into the locked decisions
above (1C's 3 additional call sites; Issue 2's missing permission-tier gate,
resolved as 2 above; the undefined tier-creation timing, resolved as 2b
above). Finding 4 (decouple unions from the identity/governance split
entirely, ship standalone) was surfaced and explicitly declined — kept
bundled per founder's consistent preference for the complete architecture
over deadline-driven scope reduction.

## Design review — required outputs

**NOT in scope (design-specific, beyond the architecture doc's own list):**

- manage-communities entry point's internal placement/structure (create-union
  form vs. invite vs. pending-list) — low-stakes, single existing page, no
  new information architecture at stake; left to implementation.
- Dedicated `/union/[id]` browse-all page, full mobile/a11y polish for the
  union UI beyond the accept/decline action — already covered by existing
  TODOS.md entries (union browse+leave, wizard mobile/a11y deferral), not
  duplicated here.

**What already exists (design-specific, reused not rebuilt):**

- DESIGN.md (established 2026-08-18, this session) — the calibration source
  for every token referenced above.
- The Sub-communities section's card/mini-card pattern — direct visual
  template for the new Unions section, same interaction shape.
- The existing `subgraphStatus: 'pending'` empty-state pattern on the
  community detail page — direct template for the "governance not yet
  configured" state's tone (informative, not alarming).

**TODOS.md updates:** none new — the design-relevant deferred items (union
browse-all page, leave-union flow, full mobile/a11y polish) were already
logged during the eng review pass; this design review didn't surface
anything beyond what's already captured there.

## Design review — Implementation Tasks

```markdown
- [ ] **T11 (P1, human: ~1h / CC: ~10min)** — frontend — Fix Sub-communities' hover:border-purple-500 to the new --color-accent token
  - Surfaced by: Design Issue 3
  - Files: apps/zugov-frontend/app/community/[id]/page.tsx
  - Verify: visual check — Sub-communities and Unions sections use the same accent color

- [ ] **T12 (P1, human: ~1h / CC: ~15min)** — frontend — Reorder community detail page cards: Info → Governance status → Sub-communities → Unions → Governance Actions
  - Surfaced by: Design Issue 1
  - Files: apps/zugov-frontend/app/community/[id]/page.tsx
  - Verify: page-level test asserting section render order

- [ ] **T13 (P1, human: ~2h / CC: ~20min)** — frontend — Union invite/accept state coverage (loading, pending badge, 403/409 inline errors, success transition)
  - Surfaced by: Design Issue 2
  - Files: new union UI components (per T9 in the eng review's task list)
  - Verify: component tests for each state in the table above; the pending badge must never render as an error/warning color

- [ ] **T14 (P2, human: ~2h / CC: ~20min)** — frontend — Baseline mobile support (44px touch targets, 375px width) for invite accept/decline specifically
  - Surfaced by: Design Issue 4
  - Files: new union UI components (accept/decline controls only, not the full feature)
  - Verify: manual check at 375px viewport; touch target size assertion if a component test framework supports it
```

## GSTACK REVIEW REPORT

| Review        | Trigger               | Why                             | Runs | Status      | Findings                                                                                                                                                                                                                               |
| ------------- | --------------------- | ------------------------------- | ---- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Eng Review    | `/plan-eng-review`    | Architecture & tests (required) | 5    | ISSUES_OPEN | 8 issues found, 3 critical gaps (double-attach race, null-address render crash, null-contractAddress deploy guard) — all resolved as locked decisions/implementation tasks, not yet implemented                                        |
| Design Review | `/plan-design-review` | UI/UX gaps                      | 1    | ISSUES_OPEN | Initial score 3/10 → 8/10 across 4 passes with findings (Info Architecture, Interaction States, Design System Alignment, Responsive/A11y); 4 decisions made, 0 unresolved. Triggered establishing DESIGN.md (none existed) mid-review. |

**CODEX:** not run (codex CLI not installed this session) — outside voices used Claude subagents instead, for both the eng review and design-consultation's research phase.
**CROSS-MODEL:** Eng review's outside-voice (Claude subagent) found 4 real gaps its own sections missed — all 4 accepted (see eng review section above). Design review ran without a separate outside-voice pass (founder chose to skip, per the eng review's outside-voice already providing recent cross-model scrutiny this session).
**VERDICT:** ARCHITECTURE + DESIGN LOCKED, IMPLEMENTATION NOT STARTED — eng review's 3 critical gaps and design review's 4 decisions all require actual implementation with test coverage (T1-T14 across both reports) before either review reads CLEAR. Ready to hand to implementation.

**UNRESOLVED DECISIONS:**

- None — all issues raised across both reviews (Eng: Architecture 1A/1B/1C/2/2b/3/4, Code Quality 4, Test 5/6; Design: Passes 1/2/5/6) were resolved via explicit user decision.
