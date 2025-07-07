from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models.inventory import Product, Inventory
from app.db.models.product_stock_intake import ProductStockIntake
from app.db.models.staff import Staff
from app.db.models.warehouse import Warehouse
from app.db.models.user_access import UserWarehouseAccess
from app.api.v1.endpoints.auth import get_current_user
from datetime import datetime
import logging

router = APIRouter()

@router.post("/", summary="Record product stock intake")
def product_stock_intake(payload: dict, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    # Enforce warehouse access
    warehouse_id = payload.get("warehouseId")
    if not warehouse_id:
        raise HTTPException(status_code=400, detail="Warehouse is required")
    # Allow admin to access all warehouses
    if hasattr(current_user, 'role') and current_user.role and current_user.role.lower() == 'admin':
        pass  # Admin bypasses warehouse access check
    else:
        access = db.query(UserWarehouseAccess).filter_by(user_id=current_user.id, warehouse_id=warehouse_id).first()
        if not access:
            raise HTTPException(status_code=403, detail="You do not have access to this warehouse.")
    try:
        logging.warning(f"[STOCK INTAKE] Received payload: {payload}")
        product_id = int(payload.get("productId"))
        quantity = int(payload.get("quantity"))
        intake_date = datetime.strptime(payload.get("intakeDate"), "%Y-%m-%d").date()
        expiry_date = payload.get("expiryDate")
        expiry_date = datetime.strptime(expiry_date, "%Y-%m-%d").date() if expiry_date else None
        staff_id = int(payload.get("staffId"))
        warehouse_id = int(warehouse_id)

        logging.warning(f"[STOCK INTAKE] Parsed IDs: product_id={product_id}, staff_id={staff_id}, warehouse_id={warehouse_id}")

        # Validate foreign keys
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            logging.error(f"[STOCK INTAKE] Product not found: {product_id}")
            raise HTTPException(status_code=400, detail="Product not found")
        staff = db.query(Staff).filter(Staff.id == staff_id).first()
        if not staff:
            logging.error(f"[STOCK INTAKE] Staff not found: {staff_id}")
            raise HTTPException(status_code=400, detail="Staff not found")
        if not warehouse_id:
            logging.error(f"[STOCK INTAKE] Warehouse ID missing in payload")
            raise HTTPException(status_code=400, detail="Warehouse is required")
        warehouse = db.query(Warehouse).filter(Warehouse.id == warehouse_id).first()
        if not warehouse:
            logging.error(f"[STOCK INTAKE] Warehouse not found: {warehouse_id}")
            raise HTTPException(status_code=400, detail="Warehouse not found")

        stock_intake = ProductStockIntake(
            product_id=product_id,
            quantity=quantity,
            date_of_intake=intake_date,
            expiry_date=expiry_date,
            intake_staff_id=staff_id
        )
        db.add(stock_intake)
        db.commit()
        db.refresh(stock_intake)
        logging.warning(f"[STOCK INTAKE] Created ProductStockIntake row: {stock_intake.__dict__}")
        # Add to Inventory table as well
        inventory_item = Inventory(
            product_id=product_id,
            quantity=quantity,
            warehouse_id=warehouse_id,
            batch_no=None,
            expiry_date=expiry_date
        )
        db.add(inventory_item)
        db.commit()
        db.refresh(inventory_item)
        logging.warning(f"[STOCK INTAKE] Created Inventory row: {inventory_item.__dict__}")
        return {"success": True, "id": stock_intake.id}
    except Exception as e:
        db.rollback()
        logging.error(f"[STOCK INTAKE] Failed to record product stock intake: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to record product stock intake: {e}")

@router.post("", summary="Record product stock intake (no trailing slash)")
def product_stock_intake_no_slash(payload: dict, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return product_stock_intake(payload, db, current_user)
