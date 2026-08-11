#!/bin/sh
set -e
pnpm --filter @maci-protocol/crypto build
pnpm --filter @maci-protocol/domainobjs build
pnpm --filter @maci-protocol/core build
pnpm --filter @maci-protocol/contracts build
pnpm --filter @maci-protocol/sdk build
cd apps/zugov-frontend && npx vite build
