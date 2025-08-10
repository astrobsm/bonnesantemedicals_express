"""
Windows Service for DigitalPersona Fingerprint Integration
This service runs in the background and provides fingerprint functionality.
"""

import win32serviceutil
import win32service
import win32event
import servicemanager
import socket
import sys
import os
import time
import logging
from threading import Thread
import asyncio
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Add the backend path to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.fingerprint_service import fingerprint_service
from app.api.v1.endpoints.fingerprint import router as fingerprint_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('fingerprint_service.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class FingerprintService(win32serviceutil.ServiceFramework):
    _svc_name_ = "AstroBSMFingerprintService"
    _svc_display_name_ = "AstroBSM Fingerprint Service"
    _svc_description_ = "DigitalPersona fingerprint integration service for AstroBSM attendance system"

    def __init__(self, args):
        win32serviceutil.ServiceFramework.__init__(self, args)
        self.hWaitStop = win32event.CreateEvent(None, 0, 0, None)
        socket.setdefaulttimeout(60)
        self.is_alive = True
        self.app = None
        self.server_thread = None

    def SvcStop(self):
        logger.info("Stopping AstroBSM Fingerprint Service...")
        self.ReportServiceStatus(win32service.SERVICE_STOP_PENDING)
        win32event.SetEvent(self.hWaitStop)
        self.is_alive = False
        
        # Cleanup fingerprint service
        if fingerprint_service:
            fingerprint_service.cleanup()
        
        logger.info("AstroBSM Fingerprint Service stopped")

    def SvcDoRun(self):
        logger.info("Starting AstroBSM Fingerprint Service...")
        servicemanager.LogMsg(servicemanager.EVENTLOG_INFORMATION_TYPE,
                            servicemanager.PYS_SERVICE_STARTED,
                            (self._svc_name_, ''))
        
        try:
            self.main()
        except Exception as e:
            logger.error(f"Service error: {e}")
            servicemanager.LogMsg(servicemanager.EVENTLOG_ERROR_TYPE,
                                servicemanager.PYS_SERVICE_STOPPED,
                                (self._svc_name_, str(e)))

    def create_app(self):
        """Create FastAPI application for fingerprint service."""
        app = FastAPI(
            title="AstroBSM Fingerprint Service",
            description="DigitalPersona fingerprint integration API",
            version="1.0.0"
        )
        
        # Add CORS middleware
        app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],  # Configure appropriately for production
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
        
        # Include fingerprint router
        app.include_router(fingerprint_router, prefix="/api/v1", tags=["fingerprint"])
        
        @app.get("/health")
        async def health_check():
            return {
                "status": "healthy",
                "service": "fingerprint",
                "reader_connected": fingerprint_service.is_reader_connected(),
                "sdk_available": fingerprint_service.sdk_available
            }
        
        return app

    def run_server(self):
        """Run the FastAPI server in a separate thread."""
        try:
            self.app = self.create_app()
            config = uvicorn.Config(
                self.app,
                host="127.0.0.1",
                port=8001,  # Different port from main app
                log_level="info",
                access_log=True
            )
            server = uvicorn.Server(config)
            
            # Run server
            asyncio.run(server.serve())
            
        except Exception as e:
            logger.error(f"Server error: {e}")

    def main(self):
        """Main service loop."""
        logger.info("Initializing fingerprint service...")
        
        # Start the FastAPI server in a separate thread
        self.server_thread = Thread(target=self.run_server, daemon=True)
        self.server_thread.start()
        
        # Service main loop
        while self.is_alive:
            # Wait for stop signal or timeout
            rc = win32event.WaitForSingleObject(self.hWaitStop, 5000)
            if rc == win32event.WAIT_OBJECT_0:
                # Service stop requested
                break
            
            # Periodic health check
            try:
                if fingerprint_service and not fingerprint_service._initialized:
                    logger.warning("Fingerprint service not initialized, attempting restart...")
                    # Attempt to reinitialize
                    if fingerprint_service.sdk_available:
                        fingerprint_service._initialize_sdk()
            except Exception as e:
                logger.error(f"Health check error: {e}")

if __name__ == '__main__':
    if len(sys.argv) == 1:
        # Run as console application for testing
        service = FingerprintService([])
        service.main()
    else:
        # Handle service installation/removal
        win32serviceutil.HandleCommandLine(FingerprintService)
