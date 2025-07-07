from pydantic import BaseModel
from typing import Optional, List
from decimal import Decimal

class PayrollBase(BaseModel):
    employee_id: int
    salary: float
    bonus: Optional[float] = 0.0
    deductions: Optional[float] = 0.0
    net_pay: float

class PayrollCreate(PayrollBase):
    pass

class Payroll(PayrollBase):
    id: int

    class Config:
        from_attributes = True

class PayrollResponse(BaseModel):
    employee_id: int
    gross_pay: Decimal
    net_pay: Decimal
    deductions: Optional[List[str]] = None

    class Config:
        from_attributes = True