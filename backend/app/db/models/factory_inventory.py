from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

class DeviceIntake(Base):
    __tablename__ = 'device_intake'

    id = Column(Integer, primary_key=True, index=True)
    device_name = Column(String, nullable=False)
    serial_number = Column(String, unique=True, nullable=False)
    quantity = Column(Integer, nullable=False)
    functions = Column(String, nullable=False)  # Comma-separated list of functions
    date_of_intake = Column(Date, nullable=False)
    cost = Column(Float, nullable=False)
    staff_id = Column(Integer, ForeignKey('staff.id'), nullable=False)
    useful_life = Column(Integer, nullable=False)
    depreciation_rate = Column(Float, nullable=False)

    staff = relationship("Staff", back_populates="device_intakes")