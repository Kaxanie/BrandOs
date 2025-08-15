#requires -Version 5.1
$ErrorActionPreference = 'Stop'

Write-Host "🚀 Starting Branding OS v1.0..."

if (-not (Test-Path 'BrandOSv1.0\package.json') -and -not (Test-Path 'package.json')) {
  Write-Error "Run from the repo root (contains package.json)"
}

# Ensure we operate inside BrandOSv1.0 dir
if (Test-Path 'BrandOSv1.0\package.json') { Set-Location 'BrandOSv1.0' }

function Need($cmd) {
  if (-not (Get-Command $cmd -ErrorAction SilentlyContinue)) {
    throw "Missing $cmd"
  }
}

Write-Host "🔍 Checking prerequisites..."
Need node
Need npm

# pnpm optional, fallback to npm
$hasPnpm = $false
try { if (Get-Command pnpm -ErrorAction SilentlyContinue) { $hasPnpm = $true } } catch {}

# psql optional for schema/seed
$hasPsql = $false
try { if (Get-Command psql -ErrorAction SilentlyContinue) { $hasPsql = $true } } catch {}

if (-not $env:DATABASE_URL) {
  $env:DATABASE_URL = "postgres://$env:USERNAME@localhost:5432/branding"
  Write-Host "⚠️  DATABASE_URL not set; using $env:DATABASE_URL"
}

if (-not $env:OPENAI_API_KEY) {
  throw "OPENAI_API_KEY required"
}

if ($hasPsql) {
  Write-Host "🗄️  Testing database connection..."
  psql "$env:DATABASE_URL" -c "SELECT 1;" | Out-Null
}

Push-Location backend
if (-not (Test-Path .env)) {
  @"
PORT=3000
DATABASE_URL=$env:DATABASE_URL
OPENAI_API_KEY=$env:OPENAI_API_KEY
JWT_SECRET=$(New-Guid)
"@ | Set-Content -NoNewline .env
}

if ($hasPnpm) { pnpm install } else { npm install }
if ($hasPsql) {
  try { psql "$env:DATABASE_URL" -f src/schema.sql | Out-Null } catch {}
  try { psql "$env:DATABASE_URL" -f src/seed.sql | Out-Null } catch {}
}
Pop-Location

Push-Location app
if ($hasPnpm) { pnpm install } else { npm install }
Pop-Location

Write-Host "🖥️  Starting backend..."
Start-Job -ScriptBlock { Set-Location $using:PWD\backend; if ($using:hasPnpm) { pnpm dev } else { npm run dev } } | Out-Null
Start-Sleep -Seconds 5

Write-Host "📱 Starting Expo..."
$env:EXPO_PUBLIC_API_BASE = "http://localhost:3000"
Start-Job -ScriptBlock { Set-Location $using:PWD\app; if ($using:hasPnpm) { pnpm expo start } else { npm run start } } | Out-Null

Write-Host "✅ Started. Use Receive-Job to view logs; Stop-Job to stop background jobs."
