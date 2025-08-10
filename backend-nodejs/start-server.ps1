# AstroBSM-Oracle Node.js Backend Startup Script
Write-Host "🚀 Starting AstroBSM-Oracle Node.js Backend..." -ForegroundColor Green

# Set location to script directory
Set-Location $PSScriptRoot

# Check if dist folder exists
if (-not (Test-Path "dist")) {
    Write-Host "📦 Building TypeScript files..." -ForegroundColor Yellow
    npm run build
}

# Start the server
Write-Host "🌐 Starting server on port 8080..." -ForegroundColor Cyan
Write-Host "📱 Frontend will be served from: http://localhost:8080" -ForegroundColor Cyan
Write-Host "🔗 API endpoints available at: http://localhost:8080/api/v1" -ForegroundColor Cyan
Write-Host "💚 Health check: http://localhost:8080/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start the Node.js server
node dist/server.js
