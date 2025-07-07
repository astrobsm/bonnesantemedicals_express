from sqlalchemy import Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

class DeviceFaultReport(Base):
    __tablename__ = 'device_fault_reports'

    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(Integer, ForeignKey('devices.id'), nullable=False)
    date = Column(Date, nullable=False)
    fault_nature = Column(String, nullable=False)
    action_required = Column(String, nullable=False)

    device = relationship('Device', back_populates='fault_reports')
