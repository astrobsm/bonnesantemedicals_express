from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from datetime import datetime, date
import json
import logging

from app.db.session import get_db
from app.db.models.fingerprint import FingerprintTemplate
from app.db.models.staff import Staff
from app.db.models.attendance import AttendanceRecord
from app.db.models.user import User
from app.schemas.fingerprint import (
    FingerprintEnrollmentRequest, 
    FingerprintEnrollmentResponse,
    FingerprintVerificationRequest,
    FingerprintVerificationResponse,
    FingerprintTemplateOut,
    FingerprintStatusResponse
)
from app.schemas.attendance import AttendanceRecordOut
from app.services.fingerprint_service import fingerprint_service

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/fingerprint/status", response_model=FingerprintStatusResponse)
async def get_fingerprint_status(db: Session = Depends(get_db)):
    """Get the status of the fingerprint system."""
    # Check if we're in simulation mode
    import os
    SKIP_DATABASE = os.getenv("SKIP_DATABASE", "false").lower() == "true"
    
    if SKIP_DATABASE:
        # Simulation mode - return simulated status
        return FingerprintStatusResponse(
            reader_connected=True,  # Simulate reader as connected
            sdk_available=fingerprint_service.sdk_available,
            service_status="active",  # Simulate as active
            total_templates=5  # Simulate some templates
        )
    
    total_templates = db.query(FingerprintTemplate).filter(FingerprintTemplate.is_active == True).count()
    
    return FingerprintStatusResponse(
        reader_connected=fingerprint_service.is_reader_connected(),
        sdk_available=fingerprint_service.sdk_available,
        service_status="active" if fingerprint_service._initialized else "inactive",
        total_templates=total_templates
    )

@router.post("/fingerprint/enroll", response_model=FingerprintEnrollmentResponse)
async def enroll_fingerprint(
    request: FingerprintEnrollmentRequest,
    db: Session = Depends(get_db)
):
    """Enroll a fingerprint for a staff member."""
    # Check if we're in simulation mode
    import os
    SKIP_DATABASE = os.getenv("SKIP_DATABASE", "false").lower() == "true"
    
    if SKIP_DATABASE:
        # Simulation mode - return successful enrollment
        return FingerprintEnrollmentResponse(
            success=True,
            message="Fingerprint enrolled successfully (simulation mode)",
            template_id=1001,
            quality_score=85,
            samples_collected=3
        )
    
    # Normal database mode
    # Check if staff exists
    staff = db.query(Staff).filter(Staff.id == request.staff_id).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff member not found")
    
    # Check if fingerprint already enrolled
    existing_template = db.query(FingerprintTemplate).filter(
        FingerprintTemplate.staff_id == request.staff_id,
        FingerprintTemplate.is_active == True
    ).first()
    
    if existing_template:
        return FingerprintEnrollmentResponse(
            success=False,
            message="Fingerprint already enrolled for this staff member",
            error="Template already exists"
        )
    
    try:
        # Perform enrollment
        enrollment_result = await fingerprint_service.enroll_fingerprint(
            request.staff_id, 
            request.finger_position
        )
        
        if not enrollment_result["success"]:
            return FingerprintEnrollmentResponse(
                success=False,
                message="Enrollment failed",
                error=enrollment_result.get("error", "Unknown error"),
                samples_collected=enrollment_result.get("samples_collected", 0)
            )
        
        # Save template to database
        template = FingerprintTemplate(
            staff_id=request.staff_id,
            template_data=enrollment_result["template"],
            finger_position=request.finger_position,
            quality_score=enrollment_result["quality"]
        )
        
        db.add(template)
        db.commit()
        db.refresh(template)
        
        logger.info(f"Fingerprint enrolled for staff {request.staff_id}")
        
        return FingerprintEnrollmentResponse(
            success=True,
            message=f"Fingerprint enrolled successfully for {staff.name}",
            template_id=template.id,
            quality_score=enrollment_result["quality"],
            samples_collected=enrollment_result["samples_collected"]
        )
        
    except Exception as e:
        logger.error(f"Error during enrollment: {e}")
        return FingerprintEnrollmentResponse(
            success=False,
            message="Enrollment failed due to system error",
            error=str(e)
        )

@router.post("/fingerprint/verify", response_model=FingerprintVerificationResponse)
async def verify_fingerprint_attendance(
    request: FingerprintVerificationRequest,
    db: Session = Depends(get_db)
):
    """Verify fingerprint and record attendance."""
    # Check if we're in simulation mode
    import os
    SKIP_DATABASE = os.getenv("SKIP_DATABASE", "false").lower() == "true"
    
    if SKIP_DATABASE:
        # Simulation mode - return successful verification
        return FingerprintVerificationResponse(
            success=True,
            matched=True,
            staff_id=request.staff_id or 1,
            staff_name="John Doe (Simulation)",
            confidence=92,
            attendance_recorded=True,
            attendance_id=2001,
            message=f"Simulation: {request.action} recorded successfully for staff member"
        )
    
    try:
        if request.staff_id:
            # Verification mode - verify specific staff member
            template = db.query(FingerprintTemplate).filter(
                FingerprintTemplate.staff_id == request.staff_id,
                FingerprintTemplate.is_active == True
            ).first()
            
            if not template:
                return FingerprintVerificationResponse(
                    success=False,
                    matched=False,
                    message="No fingerprint template found for this staff member",
                    attendance_recorded=False
                )
            
            # Verify fingerprint
            verification_result = await fingerprint_service.verify_fingerprint(template.template_data)
            
            if not verification_result["matched"]:
                return FingerprintVerificationResponse(
                    success=True,
                    matched=False,
                    message="Fingerprint verification failed",
                    confidence=verification_result["confidence"],
                    attendance_recorded=False
                )
            
            staff = template.staff
            
        else:
            # Identification mode - identify user by fingerprint
            templates = db.query(FingerprintTemplate).filter(FingerprintTemplate.is_active == True).all()
            
            if not templates:
                return FingerprintVerificationResponse(
                    success=False,
                    matched=False,
                    message="No fingerprint templates enrolled in system",
                    attendance_recorded=False
                )
            
            # Try to identify user
            staff = None
            verification_result = None
            
            for template in templates:
                result = await fingerprint_service.verify_fingerprint(template.template_data, max_attempts=1)
                if result["matched"]:
                    staff = template.staff
                    verification_result = result
                    break
            
            if not staff:
                return FingerprintVerificationResponse(
                    success=True,
                    matched=False,
                    message="Fingerprint not recognized",
                    attendance_recorded=False
                )
        
        # Update last used timestamp
        template.last_used = datetime.now()
        
        # Record attendance
        attendance_record = await _record_attendance(
            staff.id, 
            request.action, 
            verification_result["confidence"],
            db
        )
        
        db.commit()
        
        return FingerprintVerificationResponse(
            success=True,
            matched=True,
            staff_id=staff.id,
            staff_name=staff.name,
            confidence=verification_result["confidence"],
            attendance_recorded=True,
            attendance_id=attendance_record.id,
            message=f"Welcome {staff.name}! {request.action} recorded successfully."
        )
        
    except Exception as e:
        logger.error(f"Error during verification: {e}")
        return FingerprintVerificationResponse(
            success=False,
            matched=False,
            message="Verification failed due to system error",
            error=str(e),
            attendance_recorded=False
        )

async def _record_attendance(staff_id: int, action: str, confidence: int, db: Session) -> AttendanceRecord:
    """Record attendance with fingerprint verification data."""
    today = date.today()
    now = datetime.now()
    
    # Find or create attendance record for today
    record = db.query(AttendanceRecord).filter(
        AttendanceRecord.staff_id == staff_id,
        AttendanceRecord.date == today
    ).first()
    
    device_info = {
        "type": "fingerprint_reader",
        "timestamp": now.isoformat(),
        "verification_confidence": confidence
    }
    
    if action == 'IN':
        if record and record.time_in:
            raise HTTPException(status_code=400, detail="Time-in already recorded for today")
        
        if not record:
            record = AttendanceRecord(
                staff_id=staff_id,
                date=today,
                time_in=now,
                action='IN',
                fingerprint_verified=True,
                verification_confidence=confidence,
                auth_method='fingerprint',
                device_info=json.dumps(device_info)
            )
            db.add(record)
        else:
            record.time_in = now
            record.action = 'IN'
            record.fingerprint_verified = True
            record.verification_confidence = confidence
            record.auth_method = 'fingerprint'
            record.device_info = json.dumps(device_info)
            
    elif action == 'OUT':
        if not record or not record.time_in:
            raise HTTPException(status_code=400, detail="No time-in record found for today")
        if record.time_out:
            raise HTTPException(status_code=400, detail="Time-out already recorded for today")
            
        record.time_out = now
        record.action = 'OUT'
        record.fingerprint_verified = True
        record.verification_confidence = confidence
        record.auth_method = 'fingerprint'
        record.device_info = json.dumps(device_info)
        
        # Calculate hours worked
        if record.time_in:
            record.hours_worked = (record.time_out - record.time_in).total_seconds() / 3600.0
    
    return record

@router.get("/fingerprint/templates", response_model=list[FingerprintTemplateOut])
async def get_fingerprint_templates(db: Session = Depends(get_db)):
    """Get all active fingerprint templates."""
    # Check if we're in simulation mode
    import os
    SKIP_DATABASE = os.getenv("SKIP_DATABASE", "false").lower() == "true"
    
    if SKIP_DATABASE:
        # Simulation mode - return mock templates
        from app.schemas.fingerprint import FingerprintTemplateOut
        mock_templates = [
            {
                "id": 1001,
                "staff_id": 1,
                "finger_position": 1,
                "quality_score": 85,
                "enrollment_date": "2024-01-01T10:00:00",
                "is_active": True,
                "last_used": "2024-01-15T14:30:00"
            },
            {
                "id": 1002,
                "staff_id": 2,
                "finger_position": 1,
                "quality_score": 90,
                "enrollment_date": "2024-01-02T11:00:00",
                "is_active": True,
                "last_used": "2024-01-16T09:15:00"
            }
        ]
        return mock_templates
    
    templates = db.query(FingerprintTemplate).filter(FingerprintTemplate.is_active == True).all()
    return templates

@router.delete("/fingerprint/templates/{staff_id}")
async def delete_fingerprint_template(staff_id: int, db: Session = Depends(get_db)):
    """Delete/deactivate a fingerprint template."""
    # Check if we're in simulation mode
    import os
    SKIP_DATABASE = os.getenv("SKIP_DATABASE", "false").lower() == "true"
    
    if SKIP_DATABASE:
        # Simulation mode - return success
        return {"message": f"Fingerprint template for staff {staff_id} deleted successfully (simulation mode)"}
    
    template = db.query(FingerprintTemplate).filter(
        FingerprintTemplate.staff_id == staff_id,
        FingerprintTemplate.is_active == True
    ).first()
    
    if not template:
        raise HTTPException(status_code=404, detail="Fingerprint template not found")
    
    template.is_active = False
    db.commit()
    
    return {"message": "Fingerprint template deleted successfully"}

@router.post("/fingerprint/test-capture")
async def test_fingerprint_capture():
    """Test fingerprint capture functionality."""
    try:
        sample = await fingerprint_service.capture_fingerprint(timeout=10)
        if sample:
            return {
                "success": True,
                "message": "Fingerprint captured successfully",
                "sample_length": len(sample)
            }
        else:
            return {
                "success": False,
                "message": "Failed to capture fingerprint"
            }
    except Exception as e:
        return {
            "success": False,
            "message": f"Error: {str(e)}"
        }
