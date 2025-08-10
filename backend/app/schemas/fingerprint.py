from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class FingerprintEnrollmentRequest(BaseModel):
    staff_id: int
    finger_position: Optional[int] = 1

class FingerprintEnrollmentResponse(BaseModel):
    success: bool
    message: str
    template_id: Optional[int] = None
    quality_score: Optional[int] = None
    samples_collected: Optional[int] = None
    error: Optional[str] = None

class FingerprintVerificationRequest(BaseModel):
    staff_id: Optional[int] = None  # Can be None for identification mode
    action: str  # 'IN' or 'OUT'

class FingerprintVerificationResponse(BaseModel):
    success: bool
    matched: bool
    staff_id: Optional[int] = None
    staff_name: Optional[str] = None
    confidence: Optional[int] = None
    attendance_recorded: bool
    attendance_id: Optional[int] = None
    message: str
    error: Optional[str] = None

class FingerprintTemplateOut(BaseModel):
    id: int
    staff_id: int
    finger_position: int
    quality_score: int
    enrollment_date: datetime
    is_active: bool
    last_used: Optional[datetime]

    class Config:
        from_attributes = True

class FingerprintStatusResponse(BaseModel):
    reader_connected: bool
    sdk_available: bool
    service_status: str
    total_templates: int
