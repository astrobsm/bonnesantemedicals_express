from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models.inventory import Inventory
from app.db.models.user_access import UserWarehouseAccess
from app.api.v1.endpoints.auth import get_current_user
from app.db.models.warehouse_transfer import WarehouseTransfer
from app.db.models.warehouse import Warehouse
from app.db.models.product import Product
from app.schemas.warehouse_transfer import WarehouseTransferCreate, WarehouseTransferResponse
from fastapi import status

router = APIRouter()

@router.post("/transfer")
def transfer_product(
    product_id: int,
    quantity: int,
    source_warehouse_id: int,
    dest_warehouse_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # Access control
    src_access = db.query(UserWarehouseAccess).filter_by(user_id=current_user.id, warehouse_id=source_warehouse_id).first()
    dst_access = db.query(UserWarehouseAccess).filter_by(user_id=current_user.id, warehouse_id=dest_warehouse_id).first()
    if not src_access or not dst_access:
        raise HTTPException(status_code=403, detail="You do not have access to both warehouses.")
    # Deduct from source
    src_inv = db.query(Inventory).filter_by(product_id=product_id, warehouse_id=source_warehouse_id).first()
    if not src_inv or src_inv.quantity < quantity:
        raise HTTPException(status_code=400, detail="Insufficient stock in source warehouse.")
    src_inv.quantity -= quantity
    db.add(src_inv)
    # Add to destination
    dst_inv = db.query(Inventory).filter_by(product_id=product_id, warehouse_id=dest_warehouse_id).first()
    if dst_inv:
        dst_inv.quantity += quantity
    else:
        from app.db.models.inventory import Inventory
        dst_inv = Inventory(product_id=product_id, warehouse_id=dest_warehouse_id, quantity=quantity)
        db.add(dst_inv)
    db.commit()
    # Optionally, log the transfer in a new table
    return {"detail": "Transfer successful"}

@router.post("/warehouse-transfer", response_model=WarehouseTransferResponse)
def transfer_product_api(
    transfer: WarehouseTransferCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # Check warehouses and product exist
    from_wh = db.query(Warehouse).filter(Warehouse.id == transfer.from_warehouse_id).first()
    to_wh = db.query(Warehouse).filter(Warehouse.id == transfer.to_warehouse_id).first()
    product = db.query(Product).filter(Product.id == transfer.product_id).first()
    if not from_wh or not to_wh or not product:
        raise HTTPException(status_code=404, detail="Warehouse or product not found")
    if transfer.from_warehouse_id == transfer.to_warehouse_id:
        raise HTTPException(status_code=400, detail="Source and destination warehouses must be different")
    # Check stock in from_warehouse (assuming Inventory model)
    from app.db.models.inventory import Inventory
    src_inv = db.query(Inventory).filter_by(product_id=transfer.product_id, warehouse_id=transfer.from_warehouse_id).first()
    if not src_inv or src_inv.quantity < transfer.quantity:
        raise HTTPException(status_code=400, detail="Insufficient stock in source warehouse")
    src_inv.quantity -= transfer.quantity
    db.add(src_inv)
    # Add to destination
    dst_inv = db.query(Inventory).filter_by(product_id=transfer.product_id, warehouse_id=transfer.to_warehouse_id).first()
    if dst_inv:
        dst_inv.quantity += transfer.quantity
    else:
        dst_inv = Inventory(product_id=transfer.product_id, warehouse_id=transfer.to_warehouse_id, quantity=transfer.quantity)
        db.add(dst_inv)
    # Log the transfer
    transfer_obj = WarehouseTransfer(**transfer.dict())
    db.add(transfer_obj)
    db.commit()
    db.refresh(transfer_obj)
    return transfer_obj
