from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models.raw_material import RawMaterialStockIntake
from app.db.models.raw_material import RawMaterial
from app.db.models.supplier import Supplier
from app.db.models.staff import Staff
from datetime import datetime
from sqlalchemy import func

router = APIRouter()

@router.post("/raw-material-stock-intake")
def create_raw_material_stock_intake(payload: dict, db: Session = Depends(get_db)):
    try:
        # Validate and extract fields from payload
        raw_material_id = int(payload.get("rawMaterialId"))
        quantity = int(payload.get("quantity"))
        supplier_id = int(payload.get("supplier"))
        expiry_date = datetime.strptime(payload.get("expiryDate"), "%Y-%m-%d").date()
        date_of_intake = datetime.strptime(payload.get("dateOfIntake"), "%Y-%m-%d").date()
        intake_staff_id = int(payload.get("intakeStaff"))

        # Check foreign keys exist (optional, for better error messages)
        if not db.query(RawMaterial).filter(RawMaterial.id == raw_material_id).first():
            raise HTTPException(status_code=400, detail="Raw material not found")
        if not db.query(Supplier).filter(Supplier.id == supplier_id).first():
            raise HTTPException(status_code=400, detail="Supplier not found")
        if not db.query(Staff).filter(Staff.id == intake_staff_id).first():
            raise HTTPException(status_code=400, detail="Staff not found")

        stock_intake = RawMaterialStockIntake(
            raw_material_id=raw_material_id,
            quantity=quantity,
            supplier_id=supplier_id,
            expiry_date=expiry_date,
            date_of_intake=date_of_intake,
            intake_staff_id=intake_staff_id
        )
        db.add(stock_intake)
        db.commit()
        db.refresh(stock_intake)
        return {"success": True, "id": stock_intake.id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to record raw material stock intake: {e}")

@router.get("/raw-material-stock-level")
def get_raw_material_stock_level(db: Session = Depends(get_db)):
    # Aggregate stock intake quantities for each raw material
    results = (
        db.query(
            RawMaterial.id,
            RawMaterial.name,
            func.coalesce(func.sum(RawMaterialStockIntake.quantity), 0).label("quantity"),
            RawMaterial.reorder_point
        )
        .outerjoin(RawMaterialStockIntake, RawMaterial.id == RawMaterialStockIntake.raw_material_id)
        .group_by(RawMaterial.id, RawMaterial.name, RawMaterial.reorder_point)
        .all()
    )
    return [
        {
            "id": row.id,
            "name": row.name,
            "quantity": row.quantity,
            "reorderPoint": row.reorder_point
        }
        for row in results
    ]
