from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

class AttendanceRecordCreate(BaseModel):
    user_id: Optional[int] = None           # For mobile (WebAuthn)
    action: str  # 'IN' or 'OUT'
    fingerprint_verified: Optional[bool] = False
    verification_confidence: Optional[int] = None
    auth_method: Optional[str] = 'manual'  # 'fingerprint', 'manual', 'web'
    device_info: Optional[str] = None

class AttendanceRecordOut(BaseModel):
    id: int
    staff_id: int
    date: date
    time_in: Optional[datetime]
    time_out: Optional[datetime]
    hours_worked: Optional[float]
    action: Optional[str]
    fingerprint_verified: Optional[bool]
    verification_confidence: Optional[int]
    auth_method: Optional[str]
    created_at: Optional[datetime]

    class Config:
        from_attributes = True
