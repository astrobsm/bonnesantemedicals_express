#!/usr/bin/env python3
import os
import subprocess
import sys

# Get the port from environment or default to 8080
port = os.environ.get('PORT', '8080')
print(f"🚀 Starting server on port: {port}")
print(f"🌍 Environment: {os.environ.get('ENVIRONMENT', 'development')}")

# Start uvicorn with the correct port
cmd = [
    sys.executable, '-m', 'uvicorn', 
    'app.main:app', 
    '--host', '0.0.0.0', 
    '--port', str(port),
    '--log-level', 'info'
]

print(f"🔧 Command: {' '.join(cmd)}")
subprocess.run(cmd)
