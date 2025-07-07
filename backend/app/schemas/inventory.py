from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional

class ProductBase(BaseModel):
    name: str
    description: str
    unit_of_measure: str
    unit_price: float
    reorder_point: int
    opening_stock_quantity: int

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    id: int
    product_id: str

    class Config:
        from_attributes = True
        populate_by_name = True

class RawMaterialBase(BaseModel):
    name: str
    category: str
    source: str
    uom: str  # CHANGED from unit_of_measure to uom
    reorder_point: int
    unit_cost: float
    opening_stock: int

class RawMaterialCreate(RawMaterialBase):
    pass

class RawMaterial(RawMaterialBase):
    id: int

    class Config:
        from_attributes = True

class WarehouseBase(BaseModel):
    name: str
    location: str

class WarehouseCreate(WarehouseBase):
    pass

class Warehouse(WarehouseBase):
    id: int

    class Config:
        from_attributes = True

class InventoryStockLevel(BaseModel):
    product_id: int
    warehouse_id: int
    quantity: int
    status: str  # e.g., Green, Amber, Red

class InventoryCreate(BaseModel):
    product_id: int
    warehouse_id: int
    quantity: int
    status: str  # e.g., Green, Amber, Red

class InventoryUpdate(BaseModel):
    product_id: Optional[int] = None
    warehouse_id: Optional[int] = None
    quantity: Optional[int] = None
    status: Optional[str] = None  # e.g., Green, Amber, Red

class InventoryStockLevelResponse(InventoryStockLevel):
    product: Product
    warehouse_name: str

    class Config:
        from_attributes = True

class Inventory(BaseModel):
    id: int
    product_id: int
    warehouse_id: int
    quantity: int
    status: str  # e.g., Green, Amber, Red

    class Config:
        from_attributes = True

class InventoryIntake(BaseModel):
    product_id: int
    date: str
    quantity: int
    staff_id: int
    warehouse_id: int
    batch_no: str
    expiry_date: str

class InventoryIntakeResponse(InventoryIntake):
    id: int

    class Config:
        from_attributes = True

class SupplierBase(BaseModel):
    name: str
    contact_name: str
    phone: str
    address: str

class SupplierCreate(SupplierBase):
    """
    Schema for creating a new Supplier.
    Inherits all fields from SupplierBase.
    """
    pass

class SupplierRead(SupplierBase):
    id: int

    class Config:
        from_attributes = True

class DistributorBase(BaseModel):
    name: str
    contact_name: str
    phone: str
    address: str

class DistributorCreate(DistributorBase):
    """
    All fields required to create a Distributor.
    """
    pass

class DistributorRead(DistributorBase):
    id: int

    class Config:
        from_attributes = True

class MarketerCreate(BaseModel):
    name: str
    email: EmailStr
    # …any other fields…

class ProductionMaterialRequirement(BaseModel):
    raw_material_id: int
    raw_material_name: str
    quantity_needed: int

class ProductionCalculationRequest(BaseModel):
    product_id: int
    quantity: int

class ProductionCalculationResponse(BaseModel):
    product_id: int
    quantity: int
    materials: list[ProductionMaterialRequirement]

class ProductionApprovalRequest(BaseModel):
    product_id: int
    quantity: int

class ProductionApprovalResponse(BaseModel):
    success: bool
    message: str
    updated_materials: list[ProductionMaterialRequirement]