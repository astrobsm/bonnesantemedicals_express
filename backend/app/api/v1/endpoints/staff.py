from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models.staff import Staff
from app.schemas.registration import StaffOut, StaffRegistration
from sqlalchemy.exc import IntegrityError

router = APIRouter()


@router.get("", response_model=list[StaffOut])
@router.get("/", response_model=list[StaffOut])
def get_staff(db: Session = Depends(get_db)):
    try:
        staff_members = db.query(Staff).all()
        if not staff_members:
            raise HTTPException(status_code=404, detail="No staff members found")
        return [StaffOut.model_validate(staff).model_dump() for staff in staff_members]
    except Exception as e:
        print("Staff endpoint error:", e)
        raise HTTPException(status_code=500, detail=str(e))

# --- Add POST endpoint for staff registration ---
@router.post("/", response_model=StaffOut)
def register_staff(staff: StaffRegistration, db: Session = Depends(get_db)):
    try:
        # Check for duplicate staff_id
        if db.query(Staff).filter(Staff.staff_id == staff.staff_id).first():
            raise HTTPException(status_code=400, detail="Staff ID already exists")
        new_staff = Staff(
            name=staff.name,
            staff_id=staff.staff_id,
            date_of_birth=staff.dob,
            age=None,  # Optionally calculate from dob
            gender=staff.gender,
            marital_status=getattr(staff, 'marital_status', None),
            phone_number=staff.phone,
            email=None,
            next_of_kin_name=None,
            next_of_kin_phone=None,
            bank_name=staff.bank,
            account_number=staff.account_number,
            address=staff.address,
            hourly_rate=staff.hourly_rate,
            role=staff.role,
            department=staff.department,
            appointment_type=staff.appointment_type
        )
        db.add(new_staff)
        db.commit()
        db.refresh(new_staff)
        return StaffOut.model_validate(new_staff)
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(status_code=400, detail="Integrity error: likely duplicate staff_id or other unique field.")
    except Exception as e:
        db.rollback()
        print("Staff registration error:", e)
        raise HTTPException(status_code=500, detail=str(e))
