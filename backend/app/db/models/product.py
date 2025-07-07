from sqlalchemy import Column, String, Integer, Float
from sqlalchemy.orm import relationship
from app.db.base import Base

class Product(Base):
    __tablename__ = 'products'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    product_id = Column(String, unique=True, nullable=False)
    description = Column(String, nullable=False)
    unit_of_measure = Column(String, nullable=False)
    unit_price = Column(Float, nullable=False)
    reorder_point = Column(Integer, nullable=False)
    opening_stock_quantity = Column(Integer, nullable=False)
    average_production_time = Column(Float, nullable=False)
    status = Column(String, nullable=False, default="Green")

    inventory_items = relationship("Inventory", back_populates="product")
    production_outputs = relationship("ProductionOutput", back_populates="product")
    production_console_outputs = relationship("ProductionConsoleOutput", back_populates="product")