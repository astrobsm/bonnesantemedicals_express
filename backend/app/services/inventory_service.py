from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from app.db.models.inventory import Inventory, Product
from app.db.models.raw_material import RawMaterial
from app.schemas import inventory as schemas
from app.schemas.inventory import InventoryCreate, InventoryUpdate
from app.schemas.registration import CustomerCreate, WarehouseCreate, SupplierCreate, DistributorCreate
from app.db import models

class InventoryService:
    def __init__(self, db: Session):
        self.db = db

    def create_inventory_item(self, inventory_item: InventoryCreate):
        db_item = Inventory(**inventory_item.dict())
        self.db.add(db_item)
        self.db.commit()
        self.db.refresh(db_item)
        return db_item

    def get_inventory_item(self, item_id: int):
        return self.db.query(Inventory).filter(Inventory.id == item_id).first()

    def update_inventory_item(self, item_id: int, inventory_item: InventoryUpdate):
        db_item = self.get_inventory_item(item_id)
        if db_item:
            for key, value in inventory_item.dict(exclude_unset=True).items():
                setattr(db_item, key, value)
            self.db.commit()
            self.db.refresh(db_item)
        return db_item

    def delete_inventory_item(self, item_id: int):
        db_item = self.get_inventory_item(item_id)
        if db_item:
            self.db.delete(db_item)
            self.db.commit()
        return db_item

    def get_all_inventory_items(self):
        return self.db.query(Inventory).all()

def create_customer(db: Session, customer: CustomerCreate):
    new_customer = models.Customer(**customer.dict())
    db.add(new_customer)
    db.commit()
    db.refresh(new_customer)
    return new_customer

def create_warehouse(db: Session, warehouse: schemas.WarehouseCreate):
    new_warehouse = models.Warehouse(**warehouse.dict())
    db.add(new_warehouse)
    db.commit()
    db.refresh(new_warehouse)
    return new_warehouse

def create_supplier(db: Session, supplier: schemas.SupplierCreate):
    new_supplier = models.Supplier(**supplier.dict())
    db.add(new_supplier)
    db.commit()
    db.refresh(new_supplier)
    return new_supplier

def create_distributor(db: Session, distributor: schemas.DistributorCreate):
    new_distributor = models.Distributor(**distributor.dict())
    db.add(new_distributor)
    db.commit()
    db.refresh(new_distributor)
    return new_distributor

def create_marketer(db: Session, marketer: schemas.MarketerCreate):
    new_marketer = models.Marketer(**marketer.dict())
    db.add(new_marketer)
    db.commit()
    db.refresh(new_marketer)
    return new_marketer

def get_all_products(db: Session):
    return db.query(Product).all()

def get_all_raw_materials(db: Session):
    return db.query(RawMaterial).all()

def get_stock_levels(db: Session):
    # Join Inventory and Product to get product name and reorder point
    results = (
        db.query(
            models.Inventory.id,
            models.Product.name.label('productName'),
            models.Inventory.quantity.label('available_quantity'),
            models.Product.reorder_point
        )
        .join(models.Product, models.Inventory.product_id == models.Product.id)
        .all()
    )
    # Convert to list of dicts for frontend
    return [
        {
            'id': row.id,
            'productName': row.productName,
            'available_quantity': row.available_quantity,
            'reorder_point': row.reorder_point
        }
        for row in results
    ]

def get_product_stock_levels(db: Session):
    # Join Inventory, Product, and Warehouse, group by product and warehouse, sum quantities
    results = (
        db.query(
            models.Inventory.product_id,
            models.Product.name,
            models.Product.reorder_point,
            models.Inventory.warehouse_id,
            models.Warehouse.name.label('warehouse_name'),
            func.sum(models.Inventory.quantity).label('available_quantity')
        )
        .join(models.Product, models.Inventory.product_id == models.Product.id)
        .join(models.Warehouse, models.Inventory.warehouse_id == models.Warehouse.id)
        .group_by(
            models.Inventory.product_id,
            models.Product.name,
            models.Product.reorder_point,
            models.Inventory.warehouse_id,
            models.Warehouse.name
        )
        .all()
    )
    # Return as list of dicts for frontend
    return [
        {
            'id': row.product_id,
            'name': row.name,
            'available_quantity': row.available_quantity,
            'reorder_point': row.reorder_point,
            'warehouse_id': row.warehouse_id,
            'warehouse_name': row.warehouse_name
        }
        for row in results
    ]