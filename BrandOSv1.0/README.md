# Branding OS v1.0 - Complete Setup Guide

## Prerequisites

Install these tools first:
- Node.js (v18 or v20)
- pnpm (recommended) or npm
- PostgreSQL (local or cloud instance)
- OpenAI API key

## 1) Initial Setup

```bash
mkdir branding-os
cd branding-os
```

If you cloned this repo, your root is `BrandOSv1.0/` with `backend/` and `app/` inside.

## 2) Database Setup

### Local PostgreSQL (macOS example)
```bash
brew install postgresql
brew services start postgresql
createdb branding
export DATABASE_URL="postgres://$(whoami)@localhost:5432/branding"
```

### Cloud PostgreSQL (Alternative)
Use any managed Postgres like Supabase, Neon, Railway, etc. Set `DATABASE_URL` accordingly.

## 3) Backend Setup

```bash
cd backend
pnpm install
cp .env.example .env
```

Edit `.env`:

```env
PORT=3000
DATABASE_URL=postgres://username:password@host:5432/branding
OPENAI_API_KEY=sk-...
JWT_SECRET=your-super-secret-jwt-key-here

# IAP credentials (optional)
APPLE_APP_SHARED_SECRET=
APPLE_ISSUER_ID=
APPLE_KEY_ID=
APPLE_PRIVATE_KEY_BASE64=
GOOGLE_SERVICE_ACCOUNT_JSON_BASE64=
```

### Initialize Database

```bash
psql $DATABASE_URL -f src/schema.sql
psql $DATABASE_URL -f src/seed.sql
```

### Start Backend

```bash
pnpm dev
```

You should see: `Backend on :3000`

## 4) Mobile App Setup

```bash
cd ../app
pnpm install
npm install -g @expo/cli
EXPO_PUBLIC_API_BASE=http://localhost:3000 pnpm expo start
```

## 5) Testing the Connection

### Test Backend Health
```bash
curl http://localhost:3000/health
# => {"ok":true}
```

### Test Quote API
```bash
curl -X POST http://localhost:3000/quote \
  -H "Content-Type: application/json" \
  -d '{"orgId":"11111111-1111-1111-1111-111111111111","quality":"medium","n":1}'
```

## 6) Mobile App Usage

1. Expo Go: scan QR code
2. iOS Simulator: press `i`
3. Android Emulator: press `a`

Flow: Onboard → Brand Setup → Mode Select → Prompt Only → Quote → Generate → Export PNG

## 7) Key Features to Test

- Use sample brand config in store (tagline, essence, palette)
- Try different aspect ratios (1:1, 2:3, 3:2) and qualities (low/medium/high)

## 8) Troubleshooting

### Backend
```bash
psql $DATABASE_URL -c "SELECT 1;"
pnpm dev
pnpm test
```

### Frontend
```bash
expo start --clear
expo start --reset-cache
```

Common:
- OpenAI errors: check key and limits
- DB: ensure Postgres running and `DATABASE_URL` valid
- Device testing: use LAN IP in `EXPO_PUBLIC_API_BASE`

## 9) Next Steps

- Complete IAP verification (Apple/Google)
- Add auth and better error handling
- Expand tests
- Deploy backend (Railway/Render/AWS) and app via EAS

## 10) Dev Workflow

```bash
cd backend && pnpm dev
cd app && pnpm expo start
pnpm -C backend test
pnpm -C backend build
```

## Quick Start Scripts

- Bash: `./start.sh` (requires bash and psql in PATH)
- PowerShell: `./start.ps1` (Windows)


