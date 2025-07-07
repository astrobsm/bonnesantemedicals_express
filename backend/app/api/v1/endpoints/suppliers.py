from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models.supplier import Supplier

router = APIRouter()

@router.get("/")
def get_suppliers(db: Session = Depends(get_db)):
    suppliers = db.query(Supplier).all()
    return [
        {
            "id": s.id,
            "name": s.name,
            "supplier_id": s.supplier_id,
            "phone": s.phone_number,  # Use 'phone' for consistency
            "address": s.address
        }
        for s in suppliers
    ]

@router.get("", include_in_schema=False)
def get_suppliers_no_slash(db: Session = Depends(get_db)):
    suppliers = db.query(Supplier).all()
    return [
        {
            "id": s.id,
            "name": s.name,
            "supplier_id": s.supplier_id,
            "phone": s.phone_number,  # Use 'phone' for consistency
            "address": s.address
        }
        for s in suppliers
    ]
