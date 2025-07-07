from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

class CustomerPerformance(Base):
    __tablename__ = 'customer_performance'

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey('customers.id'))
    total_transactions = Column(Integer, nullable=False)
    total_amount = Column(Float, nullable=False)

    customer = relationship("Customer", back_populates="performance")