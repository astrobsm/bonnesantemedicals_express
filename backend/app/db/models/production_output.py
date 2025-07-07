from sqlalchemy import Column, Integer, ForeignKey, Float, Date
from sqlalchemy.orm import relationship
from app.db.base import Base

class ProductionOutput(Base):
    __tablename__ = 'production_output'

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey('products.id'), nullable=False)
    good_products = Column(Integer, nullable=False)
    damaged_products = Column(Integer, nullable=False)
    efficiency = Column(Float, nullable=False)
    production_date = Column(Date, nullable=False)

    product = relationship("Product", back_populates="production_outputs")