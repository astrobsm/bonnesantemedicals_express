from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime

class DeviceBase(BaseModel):
    name: str
    serial_number: str
    model: Optional[str] = None
    manufacturer: Optional[str] = None
    purchase_date: Optional[date] = None
    location: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None

class DeviceCreate(DeviceBase):
    pass

class Device(DeviceBase):
    id: int
    class Config:
        from_attributes = True

class DeviceMaintenanceLogBase(BaseModel):
    device_id: int
    maintenance_date: Optional[datetime] = None
    description: Optional[str] = None
    performed_by: Optional[str] = None
    remarks: Optional[str] = None

class DeviceMaintenanceLogCreate(DeviceMaintenanceLogBase):
    pass

class DeviceMaintenanceLog(DeviceMaintenanceLogBase):
    id: int
    class Config:
        from_attributes = True

class DeviceFaultReportBase(BaseModel):
    device_id: int
    report_date: Optional[datetime] = None
    fault_description: Optional[str] = None
    reported_by: Optional[str] = None
    status: Optional[str] = None

class DeviceFaultReportCreate(DeviceFaultReportBase):
    pass

class DeviceFaultReport(DeviceFaultReportBase):
    id: int
    class Config:
        from_attributes = True
