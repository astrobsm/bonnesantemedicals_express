#!/usr/bin/env python3
"""
Simple FastAPI server for testing fingerprint integration without database
"""
import uvicorn
import sys
import os
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

# Set environment variables to avoid database connections
os.environ["SKIP_DATABASE"] = "true"
os.environ["DEBUG"] = "true"

if __name__ == "__main__":
    print("🚀 Starting AstroBSM server in test mode (no database)")
    print("🔐 Fingerprint endpoints will run in simulation mode")
    print("🌐 Server will be available at: http://localhost:8000")
    print("📄 Test page: http://localhost:8000/fingerprint_test.html")
    print("")
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        reload_dirs=[str(backend_dir)],
        log_level="info"
    )
