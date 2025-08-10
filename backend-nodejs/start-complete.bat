@echo off
echo ========================================
echo  AstroBSM-Oracle Node.js Backend
echo ========================================
echo.

echo [1] Checking Node.js installation...
node --version
echo.

echo [2] Checking if port 8080 is available...
netstat -ano | findstr :8080
if errorlevel 1 (
    echo ✅ Port 8080 is available
) else (
    echo ⚠️ Port 8080 is already in use
)
echo.

echo [3] Starting the server...
echo 🚀 Server will start on http://localhost:8080
echo 📱 Frontend will be served from the same port
echo 🔗 API endpoints at http://localhost:8080/api/v1
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

node dist/server.js

echo.
echo Server stopped.
pause
