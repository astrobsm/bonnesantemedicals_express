from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

class ProductionConsoleOutput(Base):
    __tablename__ = 'production_console_output'

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey('products.id'), nullable=False)
    quantity_produced = Column(Integer, nullable=False)

    product = relationship("Product", back_populates="production_console_outputs")