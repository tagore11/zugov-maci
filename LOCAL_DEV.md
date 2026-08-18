# Local Development — ZuGov (backend + frontend)

Verified end-to-end from a genuine fresh clone (2026-08-18): install, build, migrate, seed,
both dev servers, and both test suites, all passing. This doc covers `apps/zugov-backend` and
`apps/zugov-frontend` specifically — the ZuGov app layer, not the wider MACI protocol monorepo
(circuits, contracts CLI, coordinator, etc., which have their own setup at
[maci.pse.dev/docs/quick-start](https://maci.pse.dev/docs/quick-start)).

## Prerequisites

- **Node 20** and **pnpm 9** (or 10) — pinned in the root `package.json`'s `engines` field and
  `packageManager: "pnpm@9.15.9"`. If you use `corepack` (`corepack enable`, ships with Node ≥16),
  the pinned pnpm version resolves automatically inside this repo — no manual version juggling
  needed. If a _different_ pnpm happens to be earlier on your `PATH` than corepack's shim (a
  standalone global pnpm install is the usual culprit), `pnpm -v` inside this repo will silently
  use the wrong version instead of the pin; run `which pnpm` to check, and prefer corepack's shim
  (found under `$(dirname "$(nvm which 20)")` if using nvm) over a global standalone install.
- **Docker**, for a local Postgres instance — no other local Postgres setup is assumed.
- A **Privy App ID** — required for the frontend to boot at all (`providers.tsx` throws loudly if
  `VITE_PRIVY_APP_ID` is missing, by design — a broken sign-in button is worse than a clear error).
  Sign up at [dashboard.privy.io](https://dashboard.privy.io), create an app, copy the App ID. This
  is a one-time, manual, per-developer (or shared team) step — nothing here automates it.

## 1. Clone and install

```bash
git clone <repo-url> && cd maci
nvm use 20   # or otherwise ensure Node 20 is active

# Scoped install: pulls in zugov-backend, zugov-frontend, and the @maci-protocol/* workspace
# packages the frontend depends on via workspace:* (contracts, core, crypto, domainobjs, sdk) —
# skips the unrelated circuits/cli/testing/coordinator/relayer/website packages, which is
# significantly lighter than a full-workspace `pnpm install` and is all either app needs.
pnpm install --filter "@zugov/backend..." --filter "zugov..."
```

`zugov-backend` has no workspace-package dependencies (self-contained); `zugov-frontend` depends
on 5 `@maci-protocol/*` packages via `workspace:*`.

## 2. Build the workspace packages the frontend imports

`zugov-frontend` imports compiled output (`build/`) from its workspace dependencies, not their
TypeScript source directly — a plain `pnpm install` alone leaves those `build/` directories
missing (you'll see `tsc` fail with `Cannot find module '@maci-protocol/domainobjs'` etc., and/or
`pnpm install` printing `WARN Failed to create bin ... ENOENT` for `maci-sdk`/`maci-contracts`).

```bash
pnpm exec lerna run build --scope "@maci-protocol/sdk" --include-dependencies
```

This builds `crypto → core → domainobjs → contracts (includes a real Solidity compile via
hardhat) → sdk`, in dependency order, automatically. Takes ~30s. One-time per fresh install (or
whenever those packages' source changes and you need the compiled output refreshed).

## 3. Environment variables

```bash
# apps/zugov-backend/.env.local
cp apps/zugov-backend/.env.example apps/zugov-backend/.env.local
# Edit DATABASE_URL's port if you don't use 5433 (see step 4).

# apps/zugov-frontend/.env.local
cp apps/zugov-frontend/.env.local.example apps/zugov-frontend/.env.local
# Fill in VITE_PRIVY_APP_ID with your own App ID from dashboard.privy.io.
```

Neither `.env.local` is committed — both are gitignored, matching the `.example` files' role as
templates only.

## 4. Database

```bash
docker run -d --name zugov-pg -e POSTGRES_PASSWORD=password -e POSTGRES_DB=zugov_dev -p 5433:5432 postgres:16

cd apps/zugov-backend
DATABASE_URL="postgres://postgres:password@localhost:5433/zugov_dev" pnpm exec drizzle-kit migrate
DATABASE_URL="postgres://postgres:password@localhost:5433/zugov_dev" pnpm run db:seed
```

Seeding creates two example communities (ZuKas Residency, ETH-NS) so the frontend has real data
to render without needing a wizard walkthrough first.

## 5. Run the apps

```bash
# Terminal 1 — backend (see the note below — .env.local isn't loaded automatically here)
cd apps/zugov-backend
pnpm run dev

# Terminal 2 — frontend
cd apps/zugov-frontend
pnpm run dev
```

**Note:** neither app's `dev` script currently loads `.env.local` automatically (no `dotenv`
wired into `tsx watch`/`vite`'s invocation beyond Vite's own built-in `VITE_*`-prefixed env
loading, which _does_ work for the frontend). For the backend specifically, either export the
vars in your shell first, or prefix the command:

```bash
cd apps/zugov-backend
DATABASE_URL="postgres://postgres:password@localhost:5433/zugov_dev" \
CORS_ORIGIN="http://localhost:5173" \
PORT=3001 \
pnpm exec tsx watch src/index.ts
```

The frontend's `pnpm run dev` (`vite`) does correctly pick up `VITE_*` vars from `.env.local` on
its own — no prefixing needed there.

Once both are running: backend on `http://localhost:3001`, frontend on `http://localhost:5173`.

## 6. Run the tests

```bash
# Backend — needs its own Postgres reachable via TEST_DATABASE_URL (or DATABASE_URL as a fallback)
cd apps/zugov-backend
DATABASE_URL="postgres://postgres:password@localhost:5433/zugov_dev" \
TEST_DATABASE_URL="postgres://postgres:password@localhost:5433/zugov_dev" \
pnpm exec vitest run

# Frontend — no DB needed, everything's mocked at the component level
cd apps/zugov-frontend
pnpm exec vitest run
```

Both suites run fully green against a freshly-migrated (not necessarily seeded) database.

## Troubleshooting

- **`tsc`/`vitest` complaining a `@maci-protocol/*` module can't be found** → you skipped or need
  to re-run step 2 (workspace packages must be built, not just installed).
- **pnpm crashes with `ERR_UNKNOWN_BUILTIN_MODULE: node:sqlite` or warns
  `This version of pnpm requires at least Node.js v22.13`** → you're running a pnpm version newer
  than this repo supports (11+) under Node 20. Check `which pnpm` — if it resolves outside this
  repo's `node_modules`/corepack shim, see the Prerequisites note above.
- **Backend `CORS_ORIGIN!.split is not a function` / crashes on boot** → `.env.local` isn't being
  read (see the Note in step 5) — export the vars or prefix the command explicitly.
- **husky pre-commit hook fails with a pnpm/Node engine mismatch** → same root cause as the pnpm
  version note above; the hook runs a real `pnpm install` + monorepo-wide typecheck, so it's
  sensitive to whichever `pnpm`/`node` your shell resolves to at commit time.
