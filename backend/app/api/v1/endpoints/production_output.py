from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date
from app.db.session import get_db
from app.db.models.production_output import ProductionOutput
from app.db.models.product import Product
from typing import List

from pydantic import BaseModel

class ProductionOutputRequest(BaseModel):
    productId: int
    goodProducts: int
    damagedProducts: int
    efficiency: float = None  # Optional, will be calculated if not provided
    participatingStaff: List[int] = []  # Not used in model, but accepted for future use
    productionDate: date = None

class ProductionOutputResponse(BaseModel):
    id: int
    productId: int
    goodProducts: int
    damagedProducts: int
    efficiency: float
    productionDate: date
    class Config:
        orm_mode = True

router = APIRouter()

@router.post("/", response_model=ProductionOutputResponse)
def create_production_output(data: ProductionOutputRequest, db: Session = Depends(get_db)):
    # Calculate efficiency if not provided or recalculate to ensure correctness
    total = data.goodProducts + data.damagedProducts
    if total == 0:
        efficiency = 0.0
    else:
        efficiency = round((data.goodProducts / total) * 100, 2)
    prod_date = data.productionDate or date.today()
    # Optionally, check if product exists
    product = db.query(Product).filter(Product.id == data.productId).first()
    if not product:
        raise HTTPException(status_code=400, detail="Product not found")
    prod_output = ProductionOutput(
        product_id=data.productId,
        good_products=data.goodProducts,
        damaged_products=data.damagedProducts,
        efficiency=efficiency,
        production_date=prod_date
    )
    db.add(prod_output)
    db.commit()
    db.refresh(prod_output)
    return ProductionOutputResponse(
        id=prod_output.id,
        productId=prod_output.product_id,
        goodProducts=prod_output.good_products,
        damagedProducts=prod_output.damaged_products,
        efficiency=prod_output.efficiency,
        productionDate=prod_output.production_date
    )

# Accept POST to /production-output (no trailing slash)
@router.post("", response_model=ProductionOutputResponse, include_in_schema=False)
def create_production_output_no_slash(data: ProductionOutputRequest, db: Session = Depends(get_db)):
    return create_production_output(data, db)
