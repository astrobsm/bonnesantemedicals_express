# PowerShell script to start all services for AstroBSM-Oracle-IVANSTAMAS
# Starts: FastAPI backend, React frontend

# Start FastAPI backend (assumes uvicorn is installed and main.py is entrypoint)
Start-Process "cmd.exe" "/k cd ..\backend\app && uvicorn main:app --reload" -WindowStyle Minimized

# Start React frontend
Start-Process "cmd.exe" "/k cd ..\frontend\react-app && npm start" -WindowStyle Minimized

Write-Host "All services started. You can close this window."
