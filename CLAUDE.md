## Design System

Always read DESIGN.md before making any visual or UI decisions.
All font choices, colors, spacing, and aesthetic direction are defined there.
Do not deviate without explicit user approval.
In QA mode, flag any code that doesn't match DESIGN.md.

## Architecture

Always read ENGINEERING.md before making structural or data-model decisions.
Core architectural principles (identity/governance separation, id vs. contractAddress,
authorization patterns) and the current data model are defined there.
Do not deviate without explicit user approval.
When a plan or review establishes a new durable architectural decision, add it to
ENGINEERING.md's Decisions Log, not just the feature's own planning doc.

## Local Development

See LOCAL_DEV.md for verified install, build, and test steps for apps/zugov-backend and
apps/zugov-frontend (scoped install, the workspace-package build step zugov-frontend needs,
env vars, database setup, and common gotchas). Keep it in sync if any of those steps change.

## apps/zugov-mvp

A separate, standalone Next.js app (own lockfile, excluded from the pnpm workspace so a UI
install never pulls circom/hardhat). It explores the mechanism-abstraction and Grounding Engine
direction: preferences are recorded once, independently of any voting rule, and every rule is a
projection of that record. See apps/zugov-mvp/README.md before changing anything under it.

Two invariants there are load-bearing and covered by tests:
- `decide()` refuses to tally a preference vector no human confirmed. Model output is always a
  draft.
- Red lines reach the outcome under every mechanism; no rule may silently drop them.

It reuses this repo's DESIGN.md tokens verbatim (terracotta accent, warm-neutral scale, IBM Plex).
It does not touch apps/zugov-frontend or apps/zugov-backend.
