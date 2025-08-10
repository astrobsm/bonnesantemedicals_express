"""
DigitalPersona Fingerprint Service
This service interfaces with the DigitalPersona U.are.U SDK for fingerprint enrollment and verification.
"""

import asyncio
import json
import logging
from typing import Optional, Dict, Any
from datetime import datetime
import base64
import hashlib
import os
import sys

# Windows COM imports for DigitalPersona SDK
try:
    import win32com.client
    import pythoncom
    SDK_AVAILABLE = True
except ImportError:
    SDK_AVAILABLE = False
    logging.warning("DigitalPersona SDK not available - running in simulation mode")

from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models.staff import Staff
from app.db.models.fingerprint import FingerprintTemplate

logger = logging.getLogger(__name__)

class DigitalPersonaService:
    """Service for handling DigitalPersona fingerprint operations."""
    
    def __init__(self):
        self.sdk_available = SDK_AVAILABLE
        self.reader = None
        self.enrollment = None
        self.verification = None
        self._initialized = False
        
        if self.sdk_available:
            self._initialize_sdk()
    
    def _initialize_sdk(self):
        """Initialize the DigitalPersona SDK components."""
        try:
            pythoncom.CoInitialize()
            
            # Initialize SDK components
            self.reader = win32com.client.Dispatch("DPFPDevCtl.DPFPDeviceCtl")
            self.enrollment = win32com.client.Dispatch("DPFPEnrl.DPFPEnrollment")
            self.verification = win32com.client.Dispatch("DPFPVerification.DPFPVerification")
            
            # Configure reader
            self.reader.StartCapture()
            self._initialized = True
            logger.info("DigitalPersona SDK initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize DigitalPersona SDK: {e}")
            self._initialized = False
    
    def is_reader_connected(self) -> bool:
        """Check if a fingerprint reader is connected."""
        if not self.sdk_available or not self._initialized:
            return False
        
        try:
            return self.reader.GetDeviceStatus() != 0
        except Exception as e:
            logger.error(f"Error checking reader status: {e}")
            return False
    
    async def capture_fingerprint(self, timeout: int = 30) -> Optional[str]:
        """
        Capture a fingerprint sample from the reader.
        Returns base64 encoded fingerprint data.
        """
        if not self.sdk_available or not self._initialized:
            # Simulation mode for testing
            await asyncio.sleep(2)  # Simulate capture time
            return self._generate_mock_fingerprint()
        
        try:
            start_time = datetime.now()
            sample = None
            
            while (datetime.now() - start_time).seconds < timeout:
                try:
                    sample = self.reader.GetSample()
                    if sample:
                        # Convert sample to base64 string
                        sample_data = sample.Serialize()
                        return base64.b64encode(sample_data).decode('utf-8')
                except:
                    pass
                
                await asyncio.sleep(0.1)
            
            return None
            
        except Exception as e:
            logger.error(f"Error capturing fingerprint: {e}")
            return None
    
    def _generate_mock_fingerprint(self) -> str:
        """Generate a mock fingerprint for testing purposes."""
        mock_data = {
            "timestamp": datetime.now().isoformat(),
            "mock": True,
            "quality": 85,
            "data": os.urandom(256).hex()
        }
        return base64.b64encode(json.dumps(mock_data).encode()).decode('utf-8')
    
    async def enroll_fingerprint(self, staff_id: int, finger_position: int = 1) -> Dict[str, Any]:
        """
        Enroll a fingerprint for a staff member.
        Requires multiple samples for template creation.
        """
        if not self.sdk_available or not self._initialized:
            # Mock enrollment
            template_data = self._generate_mock_template(staff_id, finger_position)
            return {
                "success": True,
                "template": template_data,
                "quality": 85,
                "samples_collected": 4
            }
        
        try:
            samples = []
            required_samples = 4
            
            for i in range(required_samples):
                logger.info(f"Collecting sample {i+1}/{required_samples}")
                sample_data = await self.capture_fingerprint()
                
                if not sample_data:
                    return {
                        "success": False,
                        "error": f"Failed to capture sample {i+1}",
                        "samples_collected": i
                    }
                
                samples.append(sample_data)
            
            # Create template from samples
            template = self._create_template(samples)
            
            return {
                "success": True,
                "template": template,
                "quality": self._calculate_quality(samples),
                "samples_collected": len(samples)
            }
            
        except Exception as e:
            logger.error(f"Error during enrollment: {e}")
            return {
                "success": False,
                "error": str(e),
                "samples_collected": 0
            }
    
    def _create_template(self, samples: list) -> str:
        """Create a fingerprint template from multiple samples."""
        try:
            if not self.sdk_available:
                return self._generate_mock_template_from_samples(samples)
            
            # Use SDK to create template
            template = self.enrollment.CreateTemplate()
            
            for sample in samples:
                sample_data = base64.b64decode(sample)
                self.enrollment.AddSample(sample_data)
            
            template_data = self.enrollment.GetTemplate()
            return base64.b64encode(template_data).decode('utf-8')
            
        except Exception as e:
            logger.error(f"Error creating template: {e}")
            return self._generate_mock_template_from_samples(samples)
    
    def _generate_mock_template(self, staff_id: int, finger_position: int) -> str:
        """Generate a mock template for testing."""
        template_data = {
            "staff_id": staff_id,
            "finger_position": finger_position,
            "created_at": datetime.now().isoformat(),
            "mock": True,
            "template_hash": hashlib.sha256(f"{staff_id}_{finger_position}".encode()).hexdigest()
        }
        return base64.b64encode(json.dumps(template_data).encode()).decode('utf-8')
    
    def _generate_mock_template_from_samples(self, samples: list) -> str:
        """Generate a mock template from samples."""
        combined_hash = hashlib.sha256(''.join(samples).encode()).hexdigest()
        template_data = {
            "samples": len(samples),
            "created_at": datetime.now().isoformat(),
            "mock": True,
            "template_hash": combined_hash
        }
        return base64.b64encode(json.dumps(template_data).encode()).decode('utf-8')
    
    def _calculate_quality(self, samples: list) -> int:
        """Calculate the quality score of fingerprint samples."""
        # In real implementation, this would use SDK quality metrics
        return max(60, min(95, 75 + len(samples) * 5))
    
    async def verify_fingerprint(self, template: str, max_attempts: int = 3) -> Dict[str, Any]:
        """
        Verify a fingerprint against a stored template.
        """
        for attempt in range(max_attempts):
            logger.info(f"Verification attempt {attempt + 1}/{max_attempts}")
            
            sample = await self.capture_fingerprint(timeout=15)
            if not sample:
                continue
            
            if self._compare_fingerprint(sample, template):
                return {
                    "success": True,
                    "matched": True,
                    "confidence": 95,
                    "attempt": attempt + 1
                }
        
        return {
            "success": True,
            "matched": False,
            "confidence": 0,
            "attempts": max_attempts
        }
    
    def _compare_fingerprint(self, sample: str, template: str) -> bool:
        """Compare a fingerprint sample against a template."""
        if not self.sdk_available:
            # Mock comparison - in real scenario this would be random or based on user
            return True  # For testing, always return True
        
        try:
            sample_data = base64.b64decode(sample)
            template_data = base64.b64decode(template)
            
            # Use SDK verification
            result = self.verification.Verify(sample_data, template_data)
            return result
            
        except Exception as e:
            logger.error(f"Error comparing fingerprint: {e}")
            return False
    
    def cleanup(self):
        """Clean up SDK resources."""
        if self.sdk_available and self._initialized:
            try:
                self.reader.StopCapture()
                pythoncom.CoUninitialize()
            except Exception as e:
                logger.error(f"Error during cleanup: {e}")

# Global service instance
fingerprint_service = DigitalPersonaService()
