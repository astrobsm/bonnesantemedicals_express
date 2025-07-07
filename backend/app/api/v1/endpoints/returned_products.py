from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.schemas.returned_product import ReturnedProduct, ReturnedProductCreate
from app.db.models.returned_product import ReturnedProduct as ReturnedProductModel
from app.api.v1.endpoints.auth import get_current_user
from app.db.session import get_db

router = APIRouter()

@router.post("/", response_model=ReturnedProduct)
def create_returned_product(
    returned_product: ReturnedProductCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    db_returned_product = ReturnedProductModel(**returned_product.dict())
    db.add(db_returned_product)
    db.commit()
    db.refresh(db_returned_product)
    return db_returned_product

@router.get("/", response_model=List[ReturnedProduct])
def get_returned_products(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return db.query(ReturnedProductModel).all()
