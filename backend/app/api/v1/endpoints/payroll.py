from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db import models, session
from app.schemas import payroll as payroll_schemas
from app.services import payroll_service

router = APIRouter()

@router.post("/payroll/generate", response_model=payroll_schemas.PayrollResponse)
def generate_payroll(payroll_data: payroll_schemas.PayrollCreate, db: Session = Depends(session.get_db)):
    return payroll_service.generate_payroll(payroll_data, db)

@router.get("/payroll/{staff_id}", response_model=payroll_schemas.PayrollResponse)
def get_payroll(staff_id: int, db: Session = Depends(session.get_db)):
    payroll = payroll_service.get_payroll_by_staff_id(staff_id, db)
    if not payroll:
        raise HTTPException(status_code=404, detail="Payroll not found")
    return payroll

@router.get("/payroll", response_model=list[payroll_schemas.PayrollResponse])
def list_payrolls(db: Session = Depends(session.get_db)):
    return payroll_service.list_payrolls(db)

@router.delete("/payroll/{payroll_id}", response_model=dict)
def delete_payroll(payroll_id: int, db: Session = Depends(session.get_db)):
    result = payroll_service.delete_payroll(payroll_id, db)
    if not result:
        raise HTTPException(status_code=404, detail="Payroll not found")
    return {"detail": "Payroll deleted successfully"}