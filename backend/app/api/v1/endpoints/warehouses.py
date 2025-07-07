
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models.warehouse import Warehouse
from app.db.models.user import User

router = APIRouter()


# Admin can access all warehouses, others only their assigned or registered ones
@router.get("/")
def get_warehouses(db: Session = Depends(get_db), user_id: int = None):
    if user_id is not None:
        user = db.query(User).filter(User.id == user_id).first()
        if user and user.role and user.role.lower() == 'admin':
            warehouses = db.query(Warehouse).all()
        elif user:
            warehouses = db.query(Warehouse).filter(Warehouse.manager == user.full_name).all()
        else:
            warehouses = []
    else:
        warehouses = db.query(Warehouse).filter((Warehouse.manager == None) | (Warehouse.manager == '')).all()
    return [
        {
            "id": w.id,
            "name": w.name,
            "location": w.location,
            "manager": w.manager,
            "manager_phone": w.manager_phone
        }
        for w in warehouses
    ]

@router.get("", include_in_schema=False)
def get_warehouses_no_slash(db: Session = Depends(get_db)):
    return get_warehouses(db)
