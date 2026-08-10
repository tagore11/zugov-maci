# Local dev: backend + frontend against Sepolia

Quick reference for running `apps/zugov-backend` and `apps/zugov-frontend` locally, wired up
to the Sepolia MACI deployment.

## Quick start

```bash
./scripts/dev.sh
```

That's it for a second run. On a completely fresh machine:

```bash
cp scripts/.env.example scripts/.env
# fill in PRIVATE_KEY only if apps/zugov-frontend/src/generated/sepolia.ts
# still has a zero registryAddress (i.e. Sepolia hasn't been deployed to yet)
./scripts/dev.sh
```

Ctrl+C stops both servers.

---

## What the script does

| Step | Task                             | Details                                                                                                                                                            |
| ---- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1    | Local Postgres + neon-http proxy | Docker containers `zugov-test-db` (:5433) and `zugov-neon-proxy` (:4444) — created/started if not already running, migrations applied on first creation            |
| 2    | Deploy to Sepolia                | Only if `generated/sepolia.ts` has a zero `registryAddress` — runs `pnpm run deploy:sepolia` (fresh deploy, not incremental — see below) and regenerates that file |
| 3    | Backend `.env`                   | Created if missing, pointed at the local DB proxy                                                                                                                  |
| 4    | Frontend `.env.local`            | Created from `.env.local.example` if missing                                                                                                                       |
| 5    | Start both                       | Backend on `:3001`, frontend on `:5173`                                                                                                                            |

Sepolia is the default network in the frontend (wallet connect defaults to it, and it's first
in the supported-chains list).

---

## Why the DB needs a proxy

`apps/zugov-backend` uses `@neondatabase/serverless`'s HTTP-based `neon()` driver
(`drizzle-orm/neon-http`), which only speaks Neon's HTTP proxy protocol — it does not connect to
a plain local Postgres, even with a valid `postgres://` connection string (fails with
`NeonDbError: fetch failed`). `scripts/dev.sh` works around this the same way
`apps/zugov-backend/tests/setup-neon-local.ts` does for tests: a local Postgres container behind
[`local-neon-http-proxy`](https://github.com/timowilhelm/local-neon-http-proxy), addressed via
`db.localtest.me` (resolves to `127.0.0.1`), with `NODE_OPTIONS` injecting the same
`neonConfig.fetchEndpoint` override into the dev server that the test suite uses.

If you have a real Neon `DATABASE_URL` and want to use that instead, set it in `scripts/.env` —
the script treats a non-empty `DATABASE_URL` as an override and skips the local bootstrap
entirely.

---

## Manual setup (if you'd rather not use the script)

```bash
# 1. Local DB + proxy
docker run -d --name zugov-test-db -e POSTGRES_PASSWORD=zugov -e POSTGRES_DB=zugov_test -p 5433:5432 postgres:16
docker exec -i zugov-test-db psql -U postgres -d zugov_test < apps/zugov-backend/drizzle/0000_breezy_inertia.sql
docker exec -i zugov-test-db psql -U postgres -d zugov_test < apps/zugov-backend/drizzle/0001_robust_captain_cross.sql
docker exec -i zugov-test-db psql -U postgres -d zugov_test < apps/zugov-backend/drizzle/0002_true_natasha_romanoff.sql

docker run -d --name zugov-neon-proxy -p 4444:4444 --add-host=host.docker.internal:host-gateway \
  -e PG_CONNECTION_STRING="postgres://postgres:zugov@host.docker.internal:5433/zugov_test" \
  ghcr.io/timowilhelm/local-neon-http-proxy:main

# 2. Backend .env (apps/zugov-backend/.env)
cat > apps/zugov-backend/.env <<'EOF'
DATABASE_URL=postgres://postgres:zugov@db.localtest.me:5433/zugov_test
CORS_ORIGIN=http://localhost:5173
SCROLL_SEPOLIA_RPC_URL=https://sepolia-rpc.scroll.io
PORT=3001
EOF

# 3. Run
cd apps/zugov-backend
NODE_OPTIONS="--import tsx/esm --import ./tests/setup-neon-local.ts" pnpm dev
# in another terminal:
cd apps/zugov-frontend && pnpm dev
```

---

## Redeploying / adding another network

`packages/contracts/scripts/syncFrontendConfig.ts` regenerates
`apps/zugov-frontend/src/generated/<network>.ts` from `deployed-contracts.json` +
`deploy-config.json`.

**`deploy:sepolia` is for a fresh deployment only** — it does _not_ pass `--incremental`, so
(per `Deployment.ts`'s `start()`) it wipes `deployed-contracts.json`'s `sepolia` entry before
deploying. `scripts/dev.sh` only calls it when `generated/sepolia.ts` still has a zero
`registryAddress`, which is the one case where wiping is correct (nothing to lose yet). The
already-deployed contracts aren't destroyed on-chain by this — they just become untracked locally,
and everything gets redeployed as new, separate contracts.

**To add a new policy type or otherwise update an existing Sepolia deployment, use `update:sepolia`
instead** — this is the one that's actually incremental (skips already-deployed contracts) and
regenerates the frontend config:

```bash
cd packages/contracts
pnpm run update:sepolia   # deploy --incremental + regenerate generated/sepolia.ts
```

To wire deploy+sync into another network's deploy script, add ` && pnpm run sync-frontend-config -- --network <name>`
to that network's `deploy:<name>` entry in `package.json`, then add a matching chain entry to
`apps/zugov-frontend/src/config.ts`'s `appConstants` (see the `sepolia` entry for the pattern).
Note `scroll_sepolia` is deliberately **not** wired up this way — its frontend entry is
hand-maintained from an earlier deployment not reflected in the current (empty)
`deployed-contracts.json`, and auto-syncing it would overwrite working addresses with zeros.

See `scripts/deploy.md` for the (Scroll Sepolia-specific) MACI + poll + subgraph deployment flow.
