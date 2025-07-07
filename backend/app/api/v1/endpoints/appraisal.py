from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models.appraisal import StaffAppraisal
from app.db.models.staff import Staff
from app.schemas.appraisal import StaffAppraisalCreate, StaffAppraisalOut
from typing import List
from datetime import date

router = APIRouter()

@router.post("/appraisals", response_model=StaffAppraisalOut)
def create_appraisal(data: StaffAppraisalCreate, db: Session = Depends(get_db)):
    staff = db.query(Staff).filter(Staff.id == data.staff_id).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff not found")
    appraisal = StaffAppraisal(**data.dict())
    db.add(appraisal)
    db.commit()
    db.refresh(appraisal)
    return appraisal

@router.get("/appraisals/{staff_id}", response_model=List[StaffAppraisalOut])
def get_appraisals_for_staff(staff_id: int, db: Session = Depends(get_db)):
    staff = db.query(Staff).filter(Staff.id == staff_id).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff not found")
    appraisals = db.query(StaffAppraisal).filter(StaffAppraisal.staff_id == staff_id).order_by(StaffAppraisal.date.desc()).all()
    return appraisals
