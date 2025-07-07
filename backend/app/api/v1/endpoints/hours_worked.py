from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.db.session import get_db
from app.db.models.payroll import Payroll
from app.db.models.staff import Staff

router = APIRouter()

@router.get("/hours-worked/{staff_id}")
def get_hours_worked(staff_id: int, duration: str, db: Session = Depends(get_db)):
    """
    Returns the total hours worked by a staff member over a given duration.
    Duration format: 'YYYY-MM-DD:YYYY-MM-DD' (start:end)
    """
    try:
        start_str, end_str = duration.split(":")
        start_date = datetime.strptime(start_str, "%Y-%m-%d")
        end_date = datetime.strptime(end_str, "%Y-%m-%d")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid duration format. Use 'YYYY-MM-DD:YYYY-MM-DD'.")

    staff = db.query(Staff).filter(Staff.id == staff_id).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Staff not found")

    payrolls = db.query(Payroll).filter(
        Payroll.staff_id == staff_id,
        Payroll.created_at >= start_date,
        Payroll.created_at <= end_date
    ).all()
    total_hours = float(sum(p.hours_worked for p in payrolls)) if payrolls else 0.0
    return {"hoursWorked": total_hours}
