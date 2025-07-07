from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models.device import Device as DeviceModel
from app.schemas.device import Device as DeviceSchema, DeviceCreate
from typing import List


router = APIRouter()

# Support both /devices and /devices/ for GET and POST
@router.get("", response_model=List[DeviceSchema], include_in_schema=False)
@router.get("/", response_model=List[DeviceSchema])
def get_devices(db: Session = Depends(get_db)):
    return db.query(DeviceModel).all()

@router.post("", response_model=DeviceSchema, include_in_schema=False)
@router.post("/", response_model=DeviceSchema)
def create_device(device: DeviceCreate, db: Session = Depends(get_db)):
    db_device = DeviceModel(**device.dict())
    db.add(db_device)
    db.commit()
    db.refresh(db_device)
    return db_device

@router.get("/{device_id}", response_model=DeviceSchema)
def get_device(device_id: int, db: Session = Depends(get_db)):
    device = db.query(DeviceModel).filter(DeviceModel.id == device_id).first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    return device
