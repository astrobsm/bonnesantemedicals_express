# automate_admin_recovery.ps1
# PowerShell script to ensure DB is migrated and admin user is present

$projectRoot = "C:\Users\USER\Documents\SOFTWARE DEVELOPEMENT\ORACLE DEVELOPEMENT\AstroBSM-Oracle-IVANSTAMAS"
Set-Location $projectRoot

# Activate virtual environment if it exists
if (Test-Path ".venv\Scripts\Activate.ps1") {
    . .venv\Scripts\Activate.ps1
}

# Run Alembic migrations
Write-Host "Running Alembic migrations..."
cd backend
alembic upgrade head

# Create admin user if missing
Write-Host "Creating admin user if missing..."
python create_admin_user.py

Write-Host "Admin recovery automation complete. Try logging in as blakvelvet."
