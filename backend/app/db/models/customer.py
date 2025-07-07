from sqlalchemy import Column, String, Integer
from sqlalchemy.orm import relationship
from app.db.base import Base  # Use the shared Base

class Customer(Base):
    __tablename__ = 'customers'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    customer_id = Column(String, unique=True, nullable=False)
    phone = Column(String, nullable=True)
    address = Column(String, nullable=True)
    company = Column(String, nullable=True)
    performance = relationship("CustomerPerformance", back_populates="customer")