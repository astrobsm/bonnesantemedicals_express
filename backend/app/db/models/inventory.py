from sqlalchemy import Column, Integer, String, Float, ForeignKey, Date
from sqlalchemy.orm import relationship
from app.db.base import Base
from app.db.models.product import Product  # Import the unified Product model

class Inventory(Base):
    __tablename__ = 'inventory'

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey('products.id'))
    raw_material_id = Column(Integer, ForeignKey('raw_materials.id'))
    quantity = Column(Integer, nullable=False)
    warehouse_id = Column(Integer, ForeignKey('warehouses.id'))  # Assuming a Warehouse model exists
    batch_no = Column(String)
    expiry_date = Column(Date)

    product = relationship("Product", back_populates="inventory_items")
    raw_material = relationship("RawMaterial", back_populates="inventory_items")