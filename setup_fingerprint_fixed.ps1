# AstroBSM Fingerprint Integration Setup Script
# Run this script as Administrator to set up fingerprint attendance

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "AstroBSM Fingerprint Integration Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")

if (-not $isAdmin) {
    Write-Host "This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Please right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✓ Running as Administrator" -ForegroundColor Green

# Check if in correct directory
$currentDir = Get-Location
if (-not (Test-Path "backend\setup_fingerprint.py")) {
    Write-Host "❌ Please run this script from the project root directory" -ForegroundColor Red
    Write-Host "Current directory: $currentDir" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✓ Correct directory detected" -ForegroundColor Green

# Check Python installation
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✓ Python detected: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found. Please install Python first." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Navigate to backend directory
Set-Location backend

Write-Host ""
Write-Host "Starting fingerprint integration setup..." -ForegroundColor Yellow
Write-Host ""

# Run the Python setup script
try {
    python setup_fingerprint.py
    $exitCode = $LASTEXITCODE
    
    if ($exitCode -eq 0) {
        Write-Host ""
        Write-Host "✅ Setup completed successfully!" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "⚠️ Setup completed with some issues. Check output above." -ForegroundColor Yellow
    }
} catch {
    Write-Host ""
    Write-Host "❌ Setup failed with error: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "Quick Start Guide:" -ForegroundColor Cyan
Write-Host "1. Run database migration: python -m alembic upgrade head" -ForegroundColor White
Write-Host "2. Start your main application" -ForegroundColor White
Write-Host "3. Navigate to: http://localhost:3000/fingerprint-attendance" -ForegroundColor White
Write-Host "4. Enroll staff fingerprints" -ForegroundColor White
Write-Host ""

Write-Host "Service Management:" -ForegroundColor Cyan
Write-Host "- Start: python fingerprint_service.py start" -ForegroundColor White
Write-Host "- Stop: python fingerprint_service.py stop" -ForegroundColor White
Write-Host "- Status: Check Windows Services for 'AstroBSM Fingerprint Service'" -ForegroundColor White
Write-Host ""

Read-Host "Press Enter to exit"
