# Deploy to Scroll Sepolia

Quick reference for deploying MACI + polls + subgraph.

## Prerequisites

**`packages/contracts/.env`** — must exist with:

```
PRIVATE_KEY=0x...
SCROLL_SEPOLIA_RPC_URL=https://...
```

**Zupass config** — `deploy-config.json` already has Zupass signers/eventId set.
Update them under `scroll_sepolia.ZupassPolicy` if needed.

**Subgraph** — you need a deploy key from [Graph Studio](https://thegraph.com/studio).

---

## Common invocations

```bash
# Full: MACI (incremental) + FreeForAll poll + Zupass poll + subgraph
./scripts/deploy.sh

# Contracts only (no subgraph)
./scripts/deploy.sh --no-subgraph

# New polls only — MACI already deployed
./scripts/deploy.sh --skip-maci

# FreeForAll poll only (skip Zupass)
./scripts/deploy.sh --skip-maci --no-zupass

# Everything but Zupass
./scripts/deploy.sh --no-zupass
```

Pass `GRAPH_AUTH_KEY=<key>` inline or export it first:

```bash
GRAPH_AUTH_KEY=<key> ./scripts/deploy.sh
```

---

## What the script does

| Step | Task                          | Details                                                                      |
| ---- | ----------------------------- | ---------------------------------------------------------------------------- |
| 1    | `deploy-session` hardhat task | Runs inside `packages/contracts`                                             |
| 1a   | MACI deploy                   | `deploy-full --incremental` — skips already-deployed contracts               |
| 1b   | FreeForAll poll               | Starts now, lasts **1 day**                                                  |
| 1c   | Zupass poll                   | Starts now, lasts **2 days** (skip with `--no-zupass`)                       |
| 2    | Subgraph                      | Updates `apps/subgraph/config/network.json`, builds, deploys to Graph Studio |

Poll start/end timestamps are set at runtime so each invocation starts immediately.

---

## Running the hardhat task directly

If you only want to deploy contracts (no subgraph):

```bash
cd packages/contracts
pnpm hardhat deploy-session --network scroll_sepolia
pnpm hardhat deploy-session --network scroll_sepolia --skip-maci
pnpm hardhat deploy-session --network scroll_sepolia --skip-maci --no-zupass
```

---

## Subgraph only

After contracts are deployed:

```bash
cd apps/subgraph
graph auth <GRAPH_AUTH_KEY>
NETWORK=network VERSION=v1 pnpm run build
pnpm run deploy
```

---

## State files

| File                                         | Purpose                                                            |
| -------------------------------------------- | ------------------------------------------------------------------ |
| `packages/contracts/deployed-contracts.json` | All deployed contract addresses (append-only with `--incremental`) |
| `packages/contracts/deploy-config.json`      | Deployment parameters; poll dates are updated on each run          |
| `apps/subgraph/config/network.json`          | Subgraph network config; updated automatically by the script       |

Delete `deployed-contracts.json` to start a completely fresh deployment.
