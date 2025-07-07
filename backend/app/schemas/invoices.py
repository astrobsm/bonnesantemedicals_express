from pydantic import BaseModel
from typing import Optional, List
from datetime import date

class InvoiceBase(BaseModel):
    invoice_number: str
    customer_name: str
    date: date
    total_amount: float
    status: str
    logo_url: Optional[str] = None
    pdf_url: Optional[str] = None

class InvoiceItemCreate(BaseModel):
    product_id: int
    quantity: int
    price: float

class InvoiceCreate(InvoiceBase):
    items: List[InvoiceItemCreate]
    warehouse_id: int  # NEW: warehouse selection required


class InvoiceItemOut(BaseModel):
    id: int
    product_id: int
    product_name: str | None = None
    quantity: int
    price: float

    class Config:
        from_attributes = True

class InvoiceOut(InvoiceBase):
    id: int
    items: list[InvoiceItemOut] = []
    class Config:
        from_attributes = True
