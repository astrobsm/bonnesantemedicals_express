from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, date
from app.db.session import get_db
from app.db.models.attendance import AttendanceRecord
from app.db.models.staff import Staff
from app.db.models.user import User
from app.schemas.attendance import AttendanceRecordCreate, AttendanceRecordOut

router = APIRouter()

@router.post("/attendance", response_model=AttendanceRecordOut)
def record_attendance(data: AttendanceRecordCreate, db: Session = Depends(get_db)):
    staff = None
    if data.user_id:
        # Try to find staff by id
        staff = db.query(Staff).filter(Staff.id == data.user_id).first()
        if not staff:
            # Try to find user, then match staff by email
            user = db.query(User).filter(User.id == data.user_id).first()
            if user and user.email:
                staff = db.query(Staff).filter(Staff.email == user.email).first()
        if not staff:
            raise HTTPException(status_code=404, detail="User/Staff not found")
    else:
        raise HTTPException(status_code=400, detail="No authentication data provided")

    today = date.today()
    now = datetime.now()
    record = db.query(AttendanceRecord).filter(AttendanceRecord.staff_id == staff.id, AttendanceRecord.date == today).first()
    if data.action == 'IN':
        if record and record.time_in:
            raise HTTPException(status_code=400, detail="Time-in already recorded for today")
        if not record:
            record = AttendanceRecord(
                staff_id=staff.id, 
                date=today, 
                time_in=now, 
                action='IN',
                fingerprint_verified=data.fingerprint_verified,
                verification_confidence=data.verification_confidence,
                auth_method=data.auth_method or 'manual',
                device_info=data.device_info
            )
            db.add(record)
        else:
            record.time_in = now
            record.action = 'IN'
            record.fingerprint_verified = data.fingerprint_verified
            record.verification_confidence = data.verification_confidence
            record.auth_method = data.auth_method or 'manual'
            record.device_info = data.device_info
    elif data.action == 'OUT':
        if not record or not record.time_in:
            raise HTTPException(status_code=400, detail="No time-in record found for today")
        if record.time_out:
            raise HTTPException(status_code=400, detail="Time-out already recorded for today")
        record.time_out = now
        record.action = 'OUT'
        record.fingerprint_verified = data.fingerprint_verified
        record.verification_confidence = data.verification_confidence
        record.auth_method = data.auth_method or 'manual'
        record.device_info = data.device_info
        if record.time_in:
            record.hours_worked = (record.time_out - record.time_in).total_seconds() / 3600.0
    else:
        raise HTTPException(status_code=400, detail="Invalid action")
    db.commit()
    db.refresh(record)
    return record


# New endpoint: Get all attendance records with staff names
@router.get("/attendance-with-names", response_model=list[dict])
def get_attendance_with_names(db: Session = Depends(get_db)):
    records = db.query(AttendanceRecord).order_by(AttendanceRecord.date.desc()).all()
    result = []
    for r in records:
        staff_name = r.staff.name if r.staff else None
        result.append({
            "id": r.id,
            "staff_id": r.staff_id,
            "staff_name": staff_name,
            "date": r.date,
            "time_in": r.time_in,
            "time_out": r.time_out,
            "hours_worked": r.hours_worked,
            "action": r.action,
            "fingerprint_verified": r.fingerprint_verified,
            "verification_confidence": r.verification_confidence,
            "auth_method": r.auth_method,
            "created_at": r.created_at
        })
    return result
