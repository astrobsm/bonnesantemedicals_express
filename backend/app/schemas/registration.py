from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date

class StaffRegistration(BaseModel):
    name: str
    staff_id: Optional[str] = None
    dob: str
    gender: str
    phone: str
    address: str
    bank: str
    account_number: str
    hourly_rate: float
    role: str
    department: str
    appointment_type: str

class ProductRegistration(BaseModel):
    name: str
    product_id: Optional[str] = None
    description: str
    uom: str
    source: str
    unit_price: float
    reorder_point: int
    opening_stock: int

class ProductCreate(BaseModel):
    name: str
    product_id: Optional[str] = None
    description: str
    uom: str
    source: str
    unit_price: float
    reorder_point: int
    opening_stock: int

class Product(BaseModel):
    id: int
    name: str
    product_id: str
    description: str
    uom: str = Field(..., alias="unit_of_measure")
    source: Optional[str] = Field(None, alias="source")
    unit_price: float
    reorder_point: int
    opening_stock: int = Field(..., alias="opening_stock_quantity")

    class Config:
        from_attributes = True
        populate_by_name = True

class RawMaterialRegistration(BaseModel):
    name: str
    rm_id: Optional[str] = None
    category: str
    source: str
    uom: str
    reorder_point: int
    unit_cost: float
    opening_stock: int

class RawMaterialCreate(BaseModel):
    name: str
    rm_id: Optional[str] = None
    category: str
    source: str
    uom: str
    reorder_point: int
    unit_cost: float
    opening_stock: int

class RawMaterial(BaseModel):
    id: int
    name: str
    rm_id: Optional[str] = None
    category: str
    source: str
    uom: str
    reorder_point: int
    unit_cost: float
    opening_stock: int

    class Config:
        from_attributes = True

class CustomerBase(BaseModel):
    name: str
    company: Optional[str]
    phone: str
    address: Optional[str]

class CustomerCreate(CustomerBase):
    pass

class Customer(CustomerBase):
    id: int

    class Config:
        from_attributes = True

class WarehouseBase(BaseModel):
    name: str
    wh_id: str
    location: str
    manager_name: str
    manager_phone: str
    date_created: date

class WarehouseCreate(WarehouseBase):
    pass

class Warehouse(WarehouseBase):
    id: int

    class Config:
        from_attributes = True

class SupplierBase(BaseModel):
    name: str
    phone: str
    country: str
    state: str

class SupplierCreate(SupplierBase):
    pass

class Supplier(SupplierBase):
    id: int

    class Config:
        from_attributes = True

class DistributorBase(BaseModel):
    name: str
    dist_id: str
    phone: str
    coverage: str
    address: Optional[str]

class DistributorCreate(DistributorBase):
    pass

class Distributor(DistributorBase):
    id: int

    class Config:
        from_attributes = True

class MarketerBase(BaseModel):
    name: str
    mark_id: str
    coverage: str
    phone: str
    email: str

class MarketerCreate(MarketerBase):
    pass

class Marketer(MarketerBase):
    id: int

    class Config:
        from_attributes = True

class RegistrationResponse(BaseModel):
    message: str
    success: bool
    data: Optional[dict] = None

class UserCreate(BaseModel):
    username: str
    password: str
    role: str
    facial_scan_data: Optional[bytes] = None
    qr_code: Optional[str] = None
    fingerprint_template: Optional[bytes] = None  # NEW FIELD

class User(BaseModel):
    id: int
    username: str
    role: str
    facial_scan_data: Optional[bytes] = None
    qr_code: Optional[str] = None
    fingerprint_template: Optional[bytes] = None  # NEW FIELD

    class Config:
        from_attributes = True

class StaffOut(BaseModel):
    id: int
    name: str
    staff_id: str
    date_of_birth: Optional[date]
    age: Optional[int]
    gender: Optional[str]
    marital_status: Optional[str]
    phone_number: Optional[str]
    email: Optional[str]
    next_of_kin_name: Optional[str]
    next_of_kin_phone: Optional[str]
    bank_name: Optional[str]
    account_number: Optional[str]
    address: Optional[str]
    hourly_rate: Optional[float]
    role: Optional[str]
    department: Optional[str]
    appointment_type: Optional[str]

    class Config:
        from_attributes = True