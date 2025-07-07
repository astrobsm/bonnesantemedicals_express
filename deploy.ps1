# PowerShell script: Build React, deploy to backend static, commit, and push
# Run from project root after making changes to frontend or backend

$ErrorActionPreference = 'Stop'

$projectRoot = "C:\Users\USER\Documents\SOFTWARE DEVELOPEMENT\ORACLE DEVELOPEMENT\AstroBSM-Oracle-IVANSTAMAS"
$reactApp = "$projectRoot\frontend\react-app"
$reactBuild = "$reactApp\build"
$backendStatic = "$projectRoot\backend\app\static"

Write-Host "[1/7] Building React frontend..." -ForegroundColor Cyan
Set-Location $reactApp
npm run build

Write-Host "[2/7] Copying build output to backend static directory..." -ForegroundColor Cyan
Set-Location $projectRoot
if (!(Test-Path $backendStatic)) {
    Write-Host "Backend static directory not found. Creating: $backendStatic"
    New-Item -ItemType Directory -Path $backendStatic | Out-Null
}
# Remove old static files except .gitkeep (if present)
Get-ChildItem -Path $backendStatic -Recurse | Where-Object { $_.Name -ne '.gitkeep' } | Remove-Item -Force -Recurse
Copy-Item -Path "$reactBuild\*" -Destination $backendStatic -Recurse

Write-Host "[3/7] Staging all changes for git..." -ForegroundColor Cyan
Set-Location $projectRoot
git add .

Write-Host "[4/7] Committing changes..." -ForegroundColor Cyan
$commitMsg = "Automated build+deploy: React rebuilt, static files updated, and all changes committed"
git commit -m "$commitMsg"

Write-Host "[5/7] Pushing to GitHub..." -ForegroundColor Cyan
git push

Write-Host "[6/7] Dropping and recreating public schema in production database (for full migration reset)..." -ForegroundColor Cyan
Set-Location "$projectRoot\backend"
python drop_and_recreate_db.py
Set-Location $projectRoot
Write-Host "Public schema dropped and recreated. Next deploy will re-apply all migrations from scratch."

Write-Host "[7/7] Seeding test data for all registration types..." -ForegroundColor Cyan
Set-Location "$projectRoot\backend"
python app/scripts/seed_test_data.py
Set-Location $projectRoot
Write-Host "Test data seeded."

Write-Host "✅ Build, deploy, and git push complete. Check your backend deployment and frontend UI."
