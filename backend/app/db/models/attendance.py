from sqlalchemy import Column, Integer, Date, DateTime, ForeignKey, String, Float, Boolean, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base

class AttendanceRecord(Base):
    __tablename__ = 'attendance_records'

    id = Column(Integer, primary_key=True, index=True)
    staff_id = Column(Integer, ForeignKey('staff.id'), nullable=False)
    date = Column(Date, nullable=False)
    time_in = Column(DateTime, nullable=True)
    time_out = Column(DateTime, nullable=True)
    hours_worked = Column(Float, nullable=True)
    action = Column(String, nullable=True)  # e.g., 'IN', 'OUT'
    
    # Fingerprint authentication fields
    fingerprint_verified = Column(Boolean, default=False)
    verification_confidence = Column(Integer, nullable=True)  # 0-100
    auth_method = Column(String, default='manual')  # 'fingerprint', 'manual', 'web'
    device_info = Column(Text, nullable=True)  # JSON string with device information
    
    # Audit fields
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    staff = relationship('Staff', backref='attendance_records')
