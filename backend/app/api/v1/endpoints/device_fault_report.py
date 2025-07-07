from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models.device_fault_report import DeviceFaultReport
from app.db.models.device import Device
from app.schemas.device_fault_report import DeviceFaultReportCreate, DeviceFaultReportOut
from typing import List

router = APIRouter()

@router.post("/device-fault-reports", response_model=DeviceFaultReportOut)
def create_device_fault_report(data: DeviceFaultReportCreate, db: Session = Depends(get_db)):
    device = db.query(Device).filter(Device.id == data.device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    report = DeviceFaultReport(**data.dict())
    db.add(report)
    db.commit()
    db.refresh(report)
    return report

@router.get("/device-fault-reports", response_model=List[DeviceFaultReportOut])
def list_device_fault_reports(db: Session = Depends(get_db)):
    return db.query(DeviceFaultReport).all()
