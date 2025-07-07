from sqlalchemy import Column, String, Integer, Date, Float
from sqlalchemy.orm import relationship
from app.db.base import Base  # Use the shared Base

class Staff(Base):
    __tablename__ = 'staff'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    staff_id = Column(String, unique=True, nullable=False)
    date_of_birth = Column(Date, nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(String, nullable=False)
    marital_status = Column(String, nullable=False)
    phone_number = Column(String, nullable=False)
    email = Column(String, nullable=True)
    next_of_kin_name = Column(String, nullable=False)
    next_of_kin_phone = Column(String, nullable=False)
    bank_name = Column(String, nullable=False)
    account_number = Column(String, nullable=False)
    address = Column(String, nullable=True)
    hourly_rate = Column(Float, nullable=True)
    role = Column(String, nullable=True)
    department = Column(String, nullable=True)
    appointment_type = Column(String, nullable=True)

    device_intakes = relationship("DeviceIntake", back_populates="staff")