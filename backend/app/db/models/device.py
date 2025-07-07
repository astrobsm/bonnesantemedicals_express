from sqlalchemy import Column, Integer, String, Date, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base
from datetime import datetime

class Device(Base):
    __tablename__ = 'devices'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    serial_number = Column(String, unique=True, nullable=False)
    model = Column(String, nullable=True)
    manufacturer = Column(String, nullable=True)
    purchase_date = Column(Date, nullable=True)
    location = Column(String, nullable=True)
    status = Column(String, nullable=True)  # e.g., 'active', 'inactive', 'under_maintenance'
    notes = Column(Text, nullable=True)
    # Relationships
    maintenance_logs = relationship('DeviceMaintenanceLog', back_populates='device', cascade='all, delete-orphan')
    fault_reports = relationship('DeviceFaultReport', back_populates='device', cascade='all, delete-orphan')

class DeviceMaintenanceLog(Base):
    __tablename__ = 'device_maintenance_logs'
    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(Integer, ForeignKey('devices.id'), nullable=False)
    maintenance_date = Column(DateTime, default=datetime.utcnow)
    description = Column(Text, nullable=True)
    performed_by = Column(String, nullable=True)
    remarks = Column(Text, nullable=True)
    device = relationship('Device', back_populates='maintenance_logs')
