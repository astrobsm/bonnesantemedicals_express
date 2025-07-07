from sqlalchemy import Column, String, Integer
from app.db.base import Base  # Use the shared Base

class Supplier(Base):
    __tablename__ = 'suppliers'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    supplier_id = Column(String, unique=True, nullable=True)
    phone = Column(String, nullable=True)
    country = Column(String, nullable=True)
    state = Column(String, nullable=True)
    phone_number = Column(String, nullable=True)
    address = Column(String, nullable=True)