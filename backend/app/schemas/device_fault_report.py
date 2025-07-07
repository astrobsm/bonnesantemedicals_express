from pydantic import BaseModel
from typing import Optional
from datetime import date

class DeviceFaultReportCreate(BaseModel):
    device_id: int
    date: date
    fault_nature: str
    action_required: str

class DeviceFaultReportOut(BaseModel):
    id: int
    device_id: int
    date: date
    fault_nature: str
    action_required: str

    class Config:
        orm_mode = True
