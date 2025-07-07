from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models.device import DeviceMaintenanceLog as DeviceMaintenanceLogModel
from app.db.models.device_fault_report import DeviceFaultReport
from app.schemas.device import DeviceMaintenanceLog, DeviceMaintenanceLogCreate, DeviceFaultReport, DeviceFaultReportCreate
from typing import List

router = APIRouter()

# Maintenance Logs
@router.get("/maintenance-logs", response_model=List[DeviceMaintenanceLog])
def get_maintenance_logs(db: Session = Depends(get_db)):
    return db.query(DeviceMaintenanceLog).all()

@router.post("/maintenance-logs", response_model=DeviceMaintenanceLog)
def create_maintenance_log(log: DeviceMaintenanceLogCreate, db: Session = Depends(get_db)):
    db_log = DeviceMaintenanceLogModel(**log.dict())
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

# Fault Reports
@router.get("/fault-reports", response_model=List[DeviceFaultReport])
def get_fault_reports(db: Session = Depends(get_db)):
    return db.query(DeviceFaultReport).all()

@router.post("/fault-reports", response_model=DeviceFaultReport)
def create_fault_report(report: DeviceFaultReportCreate, db: Session = Depends(get_db)):
    db_report = DeviceFaultReport(**report.dict())
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    return db_report
