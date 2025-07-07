from sqlalchemy import Column, Integer, Date, DateTime, ForeignKey, String, Float
from sqlalchemy.orm import relationship
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

    staff = relationship('Staff', backref='attendance_records')
