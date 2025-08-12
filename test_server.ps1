# Test server startup script
$env:SKIP_DATABASE = "true"
$env:ENVIRONMENT = "development"
Set-Location backend
python start_server.py
