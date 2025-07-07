from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.db import models, session
from app.schemas import inventory as inventory_schemas
from app.services import inventory_service
from app.services.inventory_service import get_all_products, get_all_raw_materials, get_stock_levels
from app.db.session import get_db
from typing import List
from app.schemas import Product, RawMaterial, Warehouse
from app.db.models.user_access import UserWarehouseAccess
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter()

@router.post("/intake", response_model=inventory_schemas.Inventory)
def intake_product(product: inventory_schemas.InventoryCreate, db: Session = Depends(session.get_db), current_user=Depends(get_current_user)):
    # Enforce warehouse access
    access = db.query(UserWarehouseAccess).filter_by(user_id=current_user.id, warehouse_id=product.warehouse_id).first()
    if not access:
        raise HTTPException(status_code=403, detail="You do not have access to this warehouse.")
    return inventory_service.create_product_intake(db=db, product=product)

@router.get("/stock-levels", response_model=list[inventory_schemas.Inventory])
def get_stock_levels(db: Session = Depends(session.get_db)):
    return inventory_service.get_stock_levels(db=db)

@router.put("/update/{product_id}", response_model=inventory_schemas.Inventory)
def update_product(product_id: int, product: inventory_schemas.InventoryUpdate, db: Session = Depends(session.get_db), current_user=Depends(get_current_user)):
    # Enforce warehouse access
    access = db.query(UserWarehouseAccess).filter_by(user_id=current_user.id, warehouse_id=product.warehouse_id).first()
    if not access:
        raise HTTPException(status_code=403, detail="You do not have access to this warehouse.")
    db_product = inventory_service.get_product(db=db, product_id=product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    return inventory_service.update_product(db=db, product_id=product_id, product=product)

@router.delete("/delete/{product_id}", response_model=dict)
def delete_product(product_id: int, db: Session = Depends(session.get_db), current_user=Depends(get_current_user)):
    # Enforce warehouse access (assume product has warehouse_id attribute)
    db_product = inventory_service.get_product(db=db, product_id=product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    access = db.query(UserWarehouseAccess).filter_by(user_id=current_user.id, warehouse_id=db_product.warehouse_id).first()
    if not access:
        raise HTTPException(status_code=403, detail="You do not have access to this warehouse.")
    inventory_service.delete_product(db=db, product_id=product_id)
    return {"detail": "Product deleted successfully"}

@router.get("/products", response_model=List[Product])
@router.get("/products/", response_model=List[Product])
def fetch_all_products(db: Session = Depends(get_db)):
    return get_all_products(db)

@router.get("/raw-materials", response_model=List[RawMaterial])
@router.get("/raw-materials/", response_model=List[RawMaterial])
def fetch_all_raw_materials(db: Session = Depends(get_db)):
    return get_all_raw_materials(db)

@router.get("/warehouses", response_model=List[Warehouse])
def fetch_all_warehouses(db: Session = Depends(get_db)):
    return db.query(models.Warehouse).all()

@router.get("/stock-level", response_model=list)
def fetch_stock_levels(db: Session = Depends(get_db)):
    try:
        stock_levels = inventory_service.get_product_stock_levels(db)
        print("DEBUG: stock_levels=", stock_levels)
        return stock_levels
    except Exception as e:
        print("Error fetching stock levels:", e)
        raise HTTPException(status_code=500, detail="Error fetching stock levels")