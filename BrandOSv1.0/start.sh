#!/usr/bin/env bash
set -euo pipefail

echo "🚀 Starting Branding OS v1.0..."

if [ ! -f "package.json" ] && [ -f "BrandOSv1.0/package.json" ]; then
  cd BrandOSv1.0
fi

if [ ! -f "package.json" ]; then
  echo "❌ Please run from the repo root (contains package.json)"
  exit 1
fi

need() { command -v "$1" >/dev/null 2>&1 || { echo "❌ Missing $1"; exit 1; }; }

echo "🔍 Checking prerequisites..."
need node
need pnpm
need psql

: "${DATABASE_URL:=${DATABASE_URL:-}}"
if [ -z "${DATABASE_URL}" ]; then
  if command -v whoami >/dev/null 2>&1; then
    export DATABASE_URL="postgres://$(whoami)@localhost:5432/branding"
    echo "⚠️  DATABASE_URL not set; using ${DATABASE_URL}"
  else
    echo "❌ DATABASE_URL not set"
    exit 1
  fi
fi

if [ -z "${OPENAI_API_KEY:-}" ]; then
  echo "❌ OPENAI_API_KEY required"; exit 1; fi

echo "🗄️  Testing database connection..."
psql "$DATABASE_URL" -c "SELECT 1;" >/dev/null

pushd backend >/dev/null
if [ ! -f .env ]; then
cat > .env << EOF
PORT=3000
DATABASE_URL=$DATABASE_URL
OPENAI_API_KEY=$OPENAI_API_KEY
JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || echo changeme)
EOF
fi

[ -d node_modules ] || pnpm install
psql "$DATABASE_URL" -f src/schema.sql 2>/dev/null || true
psql "$DATABASE_URL" -f src/seed.sql 2>/dev/null || true
popd >/dev/null

pushd app >/dev/null
[ -d node_modules ] || pnpm install
popd >/dev/null

echo "🖥️  Starting backend..."
( cd backend && pnpm dev ) &
BACK_PID=$!

sleep 5
if curl -sf http://localhost:3000/health >/dev/null; then
  echo "✅ Backend healthy"
else
  echo "❌ Backend failed to start"; kill $BACK_PID; exit 1
fi

echo "📱 Starting Expo..."
( cd app && EXPO_PUBLIC_API_BASE=http://localhost:3000 pnpm expo start )

wait
