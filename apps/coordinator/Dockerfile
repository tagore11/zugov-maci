# syntax=docker/dockerfile:1
# Copy source code and build the project
FROM node:20-alpine AS builder
RUN npm i -g pnpm@9

WORKDIR /builder

# Copy only workspace manifests first so `pnpm install` is a cached layer unless a
# dependency actually changed. Copying the whole monorepo before installing (the old
# order) meant a change to any file anywhere — even an unrelated app's comment — busted
# this layer and forced a full, unfiltered reinstall of every workspace package on every
# single deploy.
# Adding a new workspace package (packages/* or apps/*, per pnpm-workspace.yaml) requires
# adding its package.json here too, or `pnpm install` below fails to resolve the lockfile.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/coordinator/package.json apps/coordinator/package.json
COPY apps/relayer/package.json apps/relayer/package.json
COPY apps/website/package.json apps/website/package.json
COPY apps/zugov-backend/package.json apps/zugov-backend/package.json
COPY apps/zugov-frontend/package.json apps/zugov-frontend/package.json
COPY apps/subgraph/package.json apps/subgraph/package.json
COPY packages/circuits/package.json packages/circuits/package.json
COPY packages/cli/package.json packages/cli/package.json
COPY packages/contracts/package.json packages/contracts/package.json
COPY packages/core/package.json packages/core/package.json
COPY packages/crypto/package.json packages/crypto/package.json
COPY packages/domainobjs/package.json packages/domainobjs/package.json
COPY packages/sdk/package.json packages/sdk/package.json
COPY packages/testing/package.json packages/testing/package.json
# The cache mount persists pnpm's downloaded-package store across builds, independent of
# whether this layer itself is a Docker cache hit — without it, any lockfile change (routine)
# forces every dependency to be re-fetched from the registry from scratch every deploy, even
# ones already downloaded in a previous build. See ENGINEERING.md's Decisions Log.
# NOT --filter-scoped: a scoped `pnpm install --filter "@maci-protocol/coordinator..."` was
# tried and reproducibly left packages/crypto and packages/core with no node_modules at all
# (their own dependencies never linked, even though present in the pnpm store) on this
# Dockerfile's node:20-alpine/linux-amd64 combination specifically — did not reproduce on a
# native (non-Docker) install with the same filter. Root-caused to pnpm itself, not this
# Dockerfile; keeping install unscoped avoids it entirely. The build step below is scoped
# instead, which is where the real slowness/breakage (building unrelated zugov-frontend) was.
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install

# Now bring in the full source and build. Scoped to coordinator's actual dependency chain
# (verify with `pnpm exec lerna list --scope "@maci-protocol/coordinator" --include-dependencies`)
# — the old unscoped `pnpm run build` also built totally unrelated apps (zugov-frontend,
# zugov-backend, relayer, website, circuits, cli, testing), which was both the main source of
# build slowness and, once zugov-frontend's build broke for unrelated reasons, a hard failure
# blocking every coordinator deploy even though coordinator never imports it.
COPY . .
RUN pnpm exec lerna run build --scope "@maci-protocol/coordinator" --include-dependencies

WORKDIR /builder/apps/coordinator

# Create image by copying build artifacts
FROM node:20-slim AS runner
RUN npm i -g pnpm@9

RUN apt-get update && apt-get install -y \
    wget \
    libgmp10 \
    libsodium23 \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /home/node/rapidsnark/build; \
    wget -qO /home/node/rapidsnark/build/prover https://maci-devops-zkeys.s3.ap-northeast-2.amazonaws.com/rapidsnark-linux-amd64-1c137; \
    chmod +x /home/node/rapidsnark/build/prover

USER node
WORKDIR /maci
COPY --chown=node:node --from=builder /builder/ ./

# zkeys are NOT downloaded here anymore. MessageProcessor/VoteTally zkeys alone total 1GB+,
# and downloading them from a third-party upstream MACI S3 bucket meant every single build
# re-fetched all of it (slow) from a copy never actually verified to match what this
# platform's frontend/circuit setup uses. deploy/docker-compose.yml now bind-mounts the
# known-correct repo-root zkeys/ directory instead (gitignored, populated once via rsync from
# a machine that already has it right — see that file's `coordinator` service comment for the
# exact command). Local dev / CI still use `pnpm run download-zkeys:test` directly (see
# apps/coordinator/package.json, .github/workflows/coordinator.yml) — unaffected by this.

# coordinator directory
WORKDIR /maci/apps/coordinator
RUN pnpm run generate-keypair
ENV NODE_OPTIONS="--max-old-space-size=8192"

CMD ["pnpm","start:prod"]
