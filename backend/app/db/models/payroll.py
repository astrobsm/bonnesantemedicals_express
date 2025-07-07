from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Numeric, Date, Float
from sqlalchemy.orm import relationship
from app.db.base import Base  # adjust import path as needed

class Payroll(Base):
    __tablename__ = 'payroll'

    id = Column(Integer, primary_key=True, index=True)
    staff_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    period = Column(String, nullable=False)
    hours_worked = Column(Numeric(10, 2), nullable=False)
    salary = Column(Numeric(10, 2), nullable=False)
    created_at = Column(DateTime, nullable=False)

    staff = relationship("User", back_populates="payrolls")

class PayrollRecord(Base):
    __tablename__ = "payroll_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    pay_date = Column(Date)
    amount = Column(Float)

    user = relationship("User", back_populates="payroll_records")