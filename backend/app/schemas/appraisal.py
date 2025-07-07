from pydantic import BaseModel
from typing import Optional
from datetime import date

class StaffAppraisalCreate(BaseModel):
    staff_id: int
    date: date
    score: float
    remarks: Optional[str] = None
    appraiser: Optional[str] = None

class StaffAppraisalOut(BaseModel):
    id: int
    staff_id: int
    date: date
    score: float
    remarks: Optional[str]
    appraiser: Optional[str]

    class Config:
        orm_mode = True
