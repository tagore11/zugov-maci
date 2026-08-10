# Build context must be the monorepo root (apps/zugov-backend has no
# workspace:* dependencies, but the install step still needs the root
# lockfile/workspace manifest to resolve via pnpm).
FROM node:22-alpine AS build
RUN corepack enable && corepack prepare pnpm@10.30.2 --activate
# The workspace root pins engines.node=20 for its Hardhat/circuits tooling, which this
# app (engines.node>=22) doesn't use — bypass pnpm's engine check rather than lowering
# the Node version this image builds/runs with.
ENV PNPM_CONFIG_ENGINE_STRICT=false
WORKDIR /repo

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/zugov-backend/package.json apps/zugov-backend/package.json
COPY apps/subgraph/package.json apps/subgraph/package.json
RUN pnpm install --frozen-lockfile --filter @zugov/backend... --filter @maci-protocol/subgraph...

COPY apps/zugov-backend apps/zugov-backend
RUN pnpm --filter @zugov/backend run build
RUN pnpm --filter @zugov/backend deploy --prod --legacy /prod/backend

# The per-community subgraph deploy pipeline (graph-cli, mustache, the
# AssemblyScript compiler) runs from inside this same container — bundled as
# its own self-contained package (not merged into the backend's node_modules)
# since it isn't a dependency of @zugov/backend. Not --prod: graph-cli's
# codegen/deploy commands need the AssemblyScript compiler, which is a
# devDependency here.
COPY apps/subgraph apps/subgraph
RUN pnpm --filter @maci-protocol/subgraph deploy --legacy /prod/subgraph

FROM node:22-alpine AS runtime
RUN corepack enable && corepack prepare pnpm@10.30.2 --activate
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /prod/backend/node_modules ./node_modules
COPY --from=build /prod/backend/package.json ./package.json
COPY --from=build /repo/apps/zugov-backend/dist ./dist
COPY --from=build /repo/apps/zugov-backend/drizzle ./drizzle
COPY --from=build /repo/apps/zugov-backend/drizzle.config.ts ./drizzle.config.ts
COPY --from=build /prod/subgraph ./subgraph

EXPOSE 3001
CMD ["node", "dist/index.js"]
