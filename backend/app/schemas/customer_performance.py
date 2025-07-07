from pydantic import BaseModel
from typing import Optional

class CustomerPerformanceOut(BaseModel):
    id: int
    customer_id: int
    total_transactions: int
    total_amount: float
    class Config:
        from_attributes = True
