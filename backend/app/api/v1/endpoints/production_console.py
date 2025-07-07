from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models.production_requirement import ProductionRequirement, ProductionRequirementItem
from app.db.models.raw_material import RawMaterial
from app.db.models.inventory import Inventory
from app.db.models.product import Product
from app.schemas.inventory import (
    ProductionCalculationRequest, ProductionCalculationResponse, ProductionMaterialRequirement,
    ProductionApprovalRequest, ProductionApprovalResponse
)

router = APIRouter()

@router.post("/calculate-materials", response_model=ProductionCalculationResponse)
def calculate_materials(data: ProductionCalculationRequest, db: Session = Depends(get_db)):
    pr = db.query(ProductionRequirement).filter(ProductionRequirement.product_id == data.product_id).first()
    if not pr:
        raise HTTPException(status_code=404, detail="Production requirement not found for product")
    items = db.query(ProductionRequirementItem).filter(ProductionRequirementItem.production_requirement_id == pr.id).all()
    materials = []
    for item in items:
        raw_mat = db.query(RawMaterial).filter(RawMaterial.id == item.raw_material_id).first()
        if not raw_mat:
            continue
        materials.append(ProductionMaterialRequirement(
            raw_material_id=raw_mat.id,
            raw_material_name=raw_mat.name,
            quantity_needed=item.quantity * data.quantity
        ))
    return ProductionCalculationResponse(
        product_id=data.product_id,
        quantity=data.quantity,
        materials=materials
    )

@router.post("/approve-production", response_model=ProductionApprovalResponse)
def approve_production(data: ProductionApprovalRequest, db: Session = Depends(get_db)):
    pr = db.query(ProductionRequirement).filter(ProductionRequirement.product_id == data.product_id).first()
    if not pr:
        raise HTTPException(status_code=404, detail="Production requirement not found for product")
    items = db.query(ProductionRequirementItem).filter(ProductionRequirementItem.production_requirement_id == pr.id).all()
    updated_materials = []
    for item in items:
        raw_mat = db.query(RawMaterial).filter(RawMaterial.id == item.raw_material_id).first()
        if not raw_mat:
            continue
        deduction = item.quantity * data.quantity
        # Deduct from opening_stock (or inventory if you use that)
        if raw_mat.opening_stock < deduction:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for {raw_mat.name}")
        raw_mat.opening_stock -= deduction
        db.add(raw_mat)
        updated_materials.append(ProductionMaterialRequirement(
            raw_material_id=raw_mat.id,
            raw_material_name=raw_mat.name,
            quantity_needed=deduction
        ))
    db.commit()
    return ProductionApprovalResponse(
        success=True,
        message="Production approved and raw material stock updated.",
        updated_materials=updated_materials
    )
