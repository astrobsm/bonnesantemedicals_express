from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models.production_requirement import ProductionRequirement  # Use the model from db/models
from app.db.models.production_requirement import ProductionRequirementItem  # If you have this in db/models
from typing import List
from pydantic import BaseModel

class ProductionRequirementItemSchema(BaseModel):
    rawMaterialId: int
    quantity: int
    class Config:
        orm_mode = True

class ProductionRequirementCreateSchema(BaseModel):
    productId: int
    requirements: List[ProductionRequirementItemSchema]

class ProductionRequirementResponseSchema(BaseModel):
    id: int
    productId: int
    requirements: List[ProductionRequirementItemSchema]
    class Config:
        orm_mode = True

router = APIRouter()

@router.post("/", response_model=ProductionRequirementResponseSchema)
def create_production_requirement(data: ProductionRequirementCreateSchema, db: Session = Depends(get_db)):
    pr = ProductionRequirement(product_id=data.productId)
    db.add(pr)
    db.commit()
    db.refresh(pr)
    items = []
    for req in data.requirements:
        item = ProductionRequirementItem(
            production_requirement_id=pr.id,
            raw_material_id=req.rawMaterialId,
            quantity=req.quantity
        )
        db.add(item)
        items.append(item)
    db.commit()
    return ProductionRequirementResponseSchema(
        id=pr.id,
        productId=pr.product_id,
        requirements=[ProductionRequirementItemSchema(rawMaterialId=i.raw_material_id, quantity=i.quantity) for i in items]
    )

# Accept POST to /production-requirements (no trailing slash)
@router.post("", response_model=ProductionRequirementResponseSchema, include_in_schema=False)
def create_production_requirement_no_slash(data: ProductionRequirementCreateSchema, db: Session = Depends(get_db)):
    return create_production_requirement(data, db)

@router.get("/{req_id}", response_model=ProductionRequirementResponseSchema)
def get_production_requirement(req_id: int, db: Session = Depends(get_db)):
    pr = db.query(ProductionRequirement).filter(ProductionRequirement.id == req_id).first()
    if not pr:
        raise HTTPException(status_code=404, detail="Production requirement not found")
    items = db.query(ProductionRequirementItem).filter(ProductionRequirementItem.production_requirement_id == pr.id).all()
    return ProductionRequirementResponseSchema(
        id=pr.id,
        productId=pr.product_id,
        requirements=[ProductionRequirementItemSchema(rawMaterialId=i.raw_material_id, quantity=i.quantity) for i in items]
    )

@router.get("/", response_model=List[ProductionRequirementResponseSchema])
def list_production_requirements(db: Session = Depends(get_db)):
    prs = db.query(ProductionRequirement).all()
    result = []
    for pr in prs:
        items = db.query(ProductionRequirementItem).filter(ProductionRequirementItem.production_requirement_id == pr.id).all()
        result.append(ProductionRequirementResponseSchema(
            id=pr.id,
            productId=pr.product_id,
            requirements=[ProductionRequirementItemSchema(rawMaterialId=i.raw_material_id, quantity=i.quantity) for i in items]
        ))
    return result

@router.get("", response_model=List[ProductionRequirementResponseSchema], include_in_schema=False)
def list_production_requirements_no_slash(db: Session = Depends(get_db)):
    return list_production_requirements(db)

@router.put("/{req_id}", response_model=ProductionRequirementResponseSchema)
def update_production_requirement(req_id: int, data: ProductionRequirementCreateSchema, db: Session = Depends(get_db)):
    pr = db.query(ProductionRequirement).filter(ProductionRequirement.id == req_id).first()
    if not pr:
        raise HTTPException(status_code=404, detail="Production requirement not found")
    pr.product_id = data.productId
    db.query(ProductionRequirementItem).filter(ProductionRequirementItem.production_requirement_id == pr.id).delete()
    db.commit()
    items = []
    for req in data.requirements:
        item = ProductionRequirementItem(
            production_requirement_id=pr.id,
            raw_material_id=req.rawMaterialId,
            quantity=req.quantity
        )
        db.add(item)
        items.append(item)
    db.commit()
    return ProductionRequirementResponseSchema(
        id=pr.id,
        productId=pr.product_id,
        requirements=[ProductionRequirementItemSchema(rawMaterialId=i.raw_material_id, quantity=i.quantity) for i in items]
    )

@router.delete("/{req_id}")
def delete_production_requirement(req_id: int, db: Session = Depends(get_db)):
    pr = db.query(ProductionRequirement).filter(ProductionRequirement.id == req_id).first()
    if not pr:
        raise HTTPException(status_code=404, detail="Production requirement not found")
    db.query(ProductionRequirementItem).filter(ProductionRequirementItem.production_requirement_id == pr.id).delete()
    db.delete(pr)
    db.commit()
    return {"detail": "Production requirement deleted"}

@router.get("/by-product/{product_id}", response_model=ProductionRequirementResponseSchema)
def get_production_requirement_by_product(product_id: int, db: Session = Depends(get_db)):
    pr = db.query(ProductionRequirement).filter(ProductionRequirement.product_id == product_id).first()
    if not pr:
        raise HTTPException(status_code=404, detail="Production requirement not found for product")
    items = db.query(ProductionRequirementItem).filter(ProductionRequirementItem.production_requirement_id == pr.id).all()
    return ProductionRequirementResponseSchema(
        id=pr.id,
        productId=pr.product_id,
        requirements=[ProductionRequirementItemSchema(rawMaterialId=i.raw_material_id, quantity=i.quantity) for i in items]
    )
