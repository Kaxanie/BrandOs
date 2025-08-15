# Testing the Branding OS UI in Cursor

## 1. Set up the Backend First

```bash
# In the root directory
cd backend

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your actual values:
# DATABASE_URL=postgres://user:pass@localhost:5432/branding
# OPENAI_API_KEY=sk-your-key-here
# JWT_SECRET=your-secret-here
```

## 2. Set up PostgreSQL Database

```bash
# Create database and run schema
psql $DATABASE_URL -f src/schema.sql
psql $DATABASE_URL -f src/seed.sql  # This creates test org and adds wallet balance
```

## 3. Start the Backend

```bash
cd backend
pnpm dev
# Should see: "Backend on :3000"
```

## 4. Set up the Mobile App

```bash
# In new terminal, from root
cd app
pnpm install

# Install Expo CLI if you haven't
npm install -g @expo/cli

# Start the development server
EXPO_PUBLIC_API_BASE=http://localhost:3000 pnpm expo start
```

## 5. Test in Different Ways

### Option A: Web Browser (Quickest)
- Press `w` in the Expo terminal to open in web browser
- Navigate through: Onboard → BrandSetup → ModeSelect → PromptOnly

### Option B: iOS Simulator (Mac only)
```bash
# Press 'i' in Expo terminal, or:
pnpm expo run:ios
```

### Option C: Android Emulator
```bash
# Press 'a' in Expo terminal, or:
pnpm expo run:android
```

### Option D: Physical Device
- Install Expo Go app on your phone
- Scan QR code from Expo terminal

## 6. Testing the Full Flow

1. **Onboard Screen**: Click "Get started"
2. **Brand Setup**: Fill in some sample brand data:
   ```
   Tagline: "Innovation meets design"
   Essence: "Modern, bold, trustworthy"
   Logo: "ACME Corp"
   ```
3. **Mode Select**: Choose "Prompt Mode"
4. **Prompt Only**: 
   - Enter a brief like "A professional business card design"
   - Choose aspect ratio, quality, variations
   - Click "Quote & Generate"
5. **Quote Screen**: See pricing, click "Generate"
6. **Generate Screen**: View generated images

## 7. Debugging Common Issues

### Backend Connection Issues
```bash
# Check if backend is running
curl http://localhost:3000/health
# Should return: {"ok":true}
```

### Database Issues
```bash
# Test database connection
psql $DATABASE_URL -c "SELECT * FROM orgs;"
# Should show the test org
```

### CORS Issues
Make sure your backend has CORS enabled (it should from the code).

### OpenAI API Issues
The current code uses `gpt-image-1` which might not be available. You may need to modify the generate route to use a different model:

```typescript
// In backend/src/routes/generate.ts
// Replace the OpenAI call with DALL-E 3:
const response = await openai.images.generate({
  model: "dall-e-3",
  prompt: cfg.compiledPrompt,
  n: 1,
  size: SIZE_MAP[cfg.aspect] as "1024x1024" | "1024x1792" | "1792x1024",
  quality: cfg.quality === "high" ? "hd" : "standard",
  response_format: "b64_json"
});
```

## 8. Cursor-Specific Tips

### Use Cursor's Terminal Integration
- Open multiple terminals in Cursor: `Cmd/Ctrl + Shift + ``
- One for backend, one for frontend

### Debugging with Cursor
- Set breakpoints in the backend code
- Use Cursor's built-in debugger for Node.js
- View network requests in browser dev tools

### Quick File Navigation
- `Cmd/Ctrl + P` to quickly jump between files
- Use Cursor's AI chat to ask about specific code sections

## 9. Sample Test Data

If you want to test with consistent data, modify the default store values in `app/src/store.ts`:

```typescript
export const brandOverviewAtom = atom({ 
  tagline: "Innovation meets design", 
  essence: "Modern, bold, trustworthy", 
  tone: ["PROFESSIONAL", "MODERN"], 
  audience: "BUSINESS" 
});
```

## 10. Environment Variables for Local Testing

Create `app/.env.local`:
```env
EXPO_PUBLIC_API_BASE=http://localhost:3000
```

This setup should let you test the complete UI flow locally. The app will use the seeded test organization and wallet balance for testing generations.
