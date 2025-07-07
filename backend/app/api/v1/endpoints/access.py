from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models.user_access import UserWarehouseAccess, UserSectionAccess
from app.db.models.user import User
from app.db.models.warehouse import Warehouse

router = APIRouter()

@router.get("/user/{user_id}")
def get_user_access(user_id: int, db: Session = Depends(get_db)):
    warehouse_access = db.query(UserWarehouseAccess).filter_by(user_id=user_id).all()
    section_access = db.query(UserSectionAccess).filter_by(user_id=user_id).all()
    return {
        "warehouses": [wa.warehouse_id for wa in warehouse_access],
        "sections": [sa.section_name for sa in section_access]
    }

@router.post("/warehouse")
def grant_warehouse_access(user_id: int, warehouse_id: int, grant: bool, db: Session = Depends(get_db)):
    access = db.query(UserWarehouseAccess).filter_by(user_id=user_id, warehouse_id=warehouse_id).first()
    if grant and not access:
        db.add(UserWarehouseAccess(user_id=user_id, warehouse_id=warehouse_id))
        db.commit()
        return {"detail": "Access granted"}
    elif not grant and access:
        db.delete(access)
        db.commit()
        return {"detail": "Access revoked"}
    return {"detail": "No change"}

@router.post("/section")
def grant_section_access(user_id: int, section_name: str, grant: bool, db: Session = Depends(get_db)):
    access = db.query(UserSectionAccess).filter_by(user_id=user_id, section_name=section_name).first()
    if grant and not access:
        db.add(UserSectionAccess(user_id=user_id, section_name=section_name))
        db.commit()
        return {"detail": "Access granted"}
    elif not grant and access:
        db.delete(access)
        db.commit()
        return {"detail": "Access revoked"}
    return {"detail": "No change"}
