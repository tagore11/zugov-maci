#!/usr/bin/env bash
# Usage:
#   1. (optional) cp scripts/.env.example scripts/.env and fill in PRIVATE_KEY
#      if ZuGovRegistry isn't deployed to Sepolia yet.
#   2. ./scripts/dev.sh
#
# Brings up everything needed to test the frontend locally against Sepolia:
#   - local Postgres
#   - apps/zugov-backend on :3001
#   - apps/zugov-frontend on :5173, defaulting to the Sepolia network
#
# PRIVATE_KEY is only needed if ZuGovRegistry hasn't been deployed to Sepolia
# yet (apps/zugov-frontend/src/generated/sepolia.ts has a zero registryAddress).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

ENV_FILE="$SCRIPT_DIR/.env"
if [[ -f "$ENV_FILE" ]]; then
  # shellcheck source=/dev/null
  set -o allexport
  source "$ENV_FILE"
  set +o allexport
fi

CONTRACTS_DIR="$REPO_ROOT/packages/contracts"
BACKEND_DIR="$REPO_ROOT/apps/zugov-backend"
FRONTEND_DIR="$REPO_ROOT/apps/zugov-frontend"
SEPOLIA_GENERATED="$FRONTEND_DIR/src/generated/sepolia.ts"
ZERO="0x0000000000000000000000000000000000000000"

DB_CONTAINER="zugov-test-db"
DB_PORT=5433
LOCAL_DATABASE_URL="postgres://postgres:zugov@localhost:$DB_PORT/zugov_test"

die() {
  echo "✗  $*" >&2
  exit 1
}
info() { echo "→  $*"; }
ok() { echo "✓  $*"; }

# ── 1. Local Postgres ─────────────────────────────────────────────────────
# A DATABASE_URL in scripts/.env is treated as an override (e.g. a remote DB);
# otherwise we bootstrap a disposable local Postgres.
if [[ -z "${DATABASE_URL:-}" ]]; then
  command -v docker >/dev/null || die "docker is required to run a local DB (or set DATABASE_URL in scripts/.env)"

  if ! docker ps -a --format '{{.Names}}' | grep -qx "$DB_CONTAINER"; then
    info "Creating $DB_CONTAINER (Postgres on :$DB_PORT)..."
    docker run -d --name "$DB_CONTAINER" -e POSTGRES_PASSWORD=zugov -e POSTGRES_DB=zugov_test \
      -p "$DB_PORT:5432" postgres:16 >/dev/null
    sleep 3
    info "Applying migrations..."
    for migration in "$BACKEND_DIR"/drizzle/*.sql; do
      docker exec -i "$DB_CONTAINER" psql -U postgres -d zugov_test <"$migration"
    done
    ok "Local Postgres created and migrated"
  elif [[ "$(docker inspect -f '{{.State.Running}}' "$DB_CONTAINER")" != "true" ]]; then
    info "Starting existing $DB_CONTAINER..."
    docker start "$DB_CONTAINER" >/dev/null
    ok "Local Postgres started"
  else
    ok "Local Postgres already running"
  fi

  DATABASE_URL="$LOCAL_DATABASE_URL"
else
  ok "Using DATABASE_URL override from scripts/.env"
fi

# ── 2. Deploy ZuGovRegistry to Sepolia (idempotent) ──────────────────────────
CURRENT_REGISTRY=$(grep 'registryAddress =' "$SEPOLIA_GENERATED" | grep -oE '0x[0-9a-fA-F]{40}' || echo "$ZERO")

if [[ "$CURRENT_REGISTRY" == "$ZERO" ]]; then
  : "${PRIVATE_KEY:?Set PRIVATE_KEY in scripts/.env to deploy ZuGovRegistry (funded Sepolia wallet)}"
  info "Deploying to Sepolia (incremental — skips already-deployed contracts)..."
  DEPLOY_EXIT=0
  DEPLOY_OUT=$(cd "$CONTRACTS_DIR" && PRIVATE_KEY="$PRIVATE_KEY" pnpm run deploy:sepolia 2>&1) || DEPLOY_EXIT=$?
  echo "$DEPLOY_OUT"
  [[ $DEPLOY_EXIT -ne 0 ]] && die "Sepolia deployment failed (exit $DEPLOY_EXIT)"
  ok "Deployed — apps/zugov-frontend/src/generated/sepolia.ts updated"
else
  ok "ZuGovRegistry already deployed on Sepolia ($CURRENT_REGISTRY) — skipping deploy"
fi

# ── 3. Backend .env ──────────────────────────────────────────────────────────
# Written for reference/other tooling, but src/db/client.ts etc. read process.env
# directly (no dotenv call) — the actual dev server below gets these vars passed
# explicitly, not by loading this file.
CORS_ORIGIN="${CORS_ORIGIN:-http://localhost:5173}"
SCROLL_SEPOLIA_RPC_URL="${SCROLL_SEPOLIA_RPC_URL:-https://sepolia-rpc.scroll.io}"
SEPOLIA_RPC_URL="${SEPOLIA_RPC_URL:-https://ethereum-sepolia-rpc.publicnode.com}"
PORT="${PORT:-3001}"

if [[ ! -f "$BACKEND_DIR/.env" ]]; then
  info "Creating $BACKEND_DIR/.env..."
  cat >"$BACKEND_DIR/.env" <<EOF
DATABASE_URL=$DATABASE_URL
CORS_ORIGIN=$CORS_ORIGIN
SCROLL_SEPOLIA_RPC_URL=$SCROLL_SEPOLIA_RPC_URL
SEPOLIA_RPC_URL=$SEPOLIA_RPC_URL
PORT=$PORT
EOF
  ok "Backend .env created"
else
  ok "Backend .env already exists — skipping"
fi

# ── 4. Frontend .env.local ───────────────────────────────────────────────────
if [[ ! -f "$FRONTEND_DIR/.env.local" ]]; then
  cp "$FRONTEND_DIR/.env.local.example" "$FRONTEND_DIR/.env.local"
  ok "Frontend .env.local created"
else
  ok "Frontend .env.local already exists — skipping"
fi

# ── 5. Start services ────────────────────────────────────────────────────────
info "Starting backend and frontend..."

(
  cd "$BACKEND_DIR" &&
    DATABASE_URL="$DATABASE_URL" CORS_ORIGIN="$CORS_ORIGIN" \
      SCROLL_SEPOLIA_RPC_URL="$SCROLL_SEPOLIA_RPC_URL" SEPOLIA_RPC_URL="$SEPOLIA_RPC_URL" PORT="$PORT" \
      pnpm dev
) &
BACKEND_PID=$!

(cd "$FRONTEND_DIR" && pnpm dev) &
FRONTEND_PID=$!

cleanup() {
  echo
  info "Shutting down..."
  kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

echo ""
echo "┌──────────────────────────────────────────┐"
echo "│  Backend:  http://localhost:3001          │"
echo "│  Frontend: http://localhost:5173          │"
echo "│  Default network: Sepolia                 │"
echo "│  Press Ctrl+C to stop both                │"
echo "└──────────────────────────────────────────┘"
echo ""

wait
