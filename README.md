# Branding OS v1.0 - Complete Setup Guide

## Prerequisites

Install these tools first:
- Node.js (v18 or v20)
- pnpm (recommended) or npm
- PostgreSQL (local or cloud instance)
- OpenAI API key (with image generation access)

## 1. Initial Setup

Clone or create your project directory:
```bash
mkdir branding-os
cd branding-os
```

## 2. Database Setup

### Local PostgreSQL
```bash
# Install PostgreSQL (macOS with Homebrew)
brew install postgresql
brew services start postgresql

# Create database
createdb branding

# Set connection string
export DATABASE_URL="postgres://$(whoami)@localhost:5432/branding"
```

### Cloud PostgreSQL (Alternative)
Use services like:
- Supabase (free tier): https://supabase.com
- Neon (free tier): https://neon.tech
- Railway (free tier): https://railway.app

## 3. Backend Setup

```bash
cd backend

# Install dependencies
pnpm install

# Create environment file
cp .env.example .env
```

Edit `.env`:
```env
PORT=3000
DATABASE_URL=postgres://username:password@host:5432/branding
OPENAI_API_KEY=sk-proj-your-openai-key-here
JWT_SECRET=your-super-secret-jwt-key-here

# IAP credentials (optional for now)
APPLE_APP_SHARED_SECRET=
APPLE_ISSUER_ID=
APPLE_KEY_ID=
APPLE_PRIVATE_KEY_BASE64=
GOOGLE_SERVICE_ACCOUNT_JSON_BASE64=
```

### Initialize Database
```bash
# Run schema
psql $DATABASE_URL -f src/schema.sql

# Seed test data
psql $DATABASE_URL -f src/seed.sql
```

### Start Backend
```bash
pnpm dev
```

You should see: `Backend on :3000`

## 4. Mobile App Setup

```bash
cd ../app

# Install dependencies
pnpm install

# Install Expo CLI globally if needed
npm install -g @expo/cli

# Start the development server
EXPO_PUBLIC_API_BASE=http://localhost:3000 pnpm expo start
```

## 5. Testing the Connection

### Test Backend Health
```bash
curl http://localhost:3000/health
# Should return: {"ok":true}
```

### Test Quote API
```bash
curl -X POST http://localhost:3000/quote \
  -H "Content-Type: application/json" \
  -d '{"orgId":"11111111-1111-1111-1111-111111111111","quality":"medium","n":1}'
```

## 6. Mobile App Usage

1. Expo Go: Scan QR code with Expo Go app
2. iOS Simulator: Press `i` in terminal
3. Android Emulator: Press `a` in terminal

### App Flow:
1. Onboard → Get started
2. Brand Setup → Configure your brand
3. Mode Select → Choose generation mode
4. Prompt Only → Enter description and generate

## 7. Key Features to Test

### Brand Configuration
- Tagline: "Innovative Solutions"
- Essence: "Modern, clean, professional"
- Colors are pre-configured in the store

### Image Generation
- Enter a prompt like: "A modern logo for a tech startup"
- Select aspect ratio (1:1, 2:3, 3:2)
- Choose quality (low/medium/high)
- Generate and export PNG

## 8. Troubleshooting

### Backend Issues
```bash
# Check database connection
psql $DATABASE_URL -c "SELECT 1;"

# View logs
pnpm dev

# Run tests
pnpm test
```

### Frontend Issues
```bash
# Clear Expo cache
expo start --clear

# Reset metro cache
expo start --reset-cache
```

### Common Issues

1. OpenAI API Error:
   - Verify API key and model access
   - Check usage limits

2. Database Connection:
   - Ensure PostgreSQL is running
   - Verify DATABASE_URL format

3. Mobile Connection:
   - Use your computer's IP instead of localhost for device testing
   - Update EXPO_PUBLIC_API_BASE=http://192.168.1.xxx:3000

## 9. Next Steps

### Essential Improvements
1. Complete IAP Integration: Implement real Apple/Google payment verification
2. Error Handling: Add comprehensive error boundaries
3. Testing: Expand test coverage
4. Authentication: Add user authentication
5. Deployment: Deploy to production

### Production Deployment
- Backend: Railway, Render, or AWS
- Database: Supabase, Neon, or AWS RDS
- Mobile: EAS Build for app stores

## 10. Development Workflow

```bash
# Backend development
cd backend && pnpm dev

# Frontend development  
cd app && pnpm expo start

# Run tests
pnpm test

# Build for production
pnpm build
```

## Support

If you encounter issues:
1. Check the logs in terminal
2. Verify environment variables
3. Test API endpoints with curl
4. Check database connectivity

The system uses a wallet-based billing model where users top up credits and generate images by debiting from their balance. The test org has $50 in credits to start with.

