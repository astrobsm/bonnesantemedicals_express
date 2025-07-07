from pydantic import BaseModel
from typing import Optional
from datetime import date

class ReturnedProductBase(BaseModel):
    product_id: int
    quantity: int
    batch_no: Optional[str] = None
    manufacturing_date: Optional[date] = None
    expiry_date: Optional[date] = None
    date_of_return: date
    reason: str
    customer_id: int
    receiving_staff_id: int

class ReturnedProductCreate(ReturnedProductBase):
    pass

class ReturnedProduct(ReturnedProductBase):
    id: int
    class Config:
        orm_mode = True
