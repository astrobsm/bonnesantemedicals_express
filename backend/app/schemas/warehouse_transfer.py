from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class WarehouseTransferBase(BaseModel):
    from_warehouse_id: int
    to_warehouse_id: int
    product_id: int
    quantity: int

class WarehouseTransferCreate(WarehouseTransferBase):
    pass

class WarehouseTransferResponse(WarehouseTransferBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True
