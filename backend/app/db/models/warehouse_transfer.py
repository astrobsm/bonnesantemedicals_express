from sqlalchemy import Column, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.db.session import Base
import datetime

class WarehouseTransfer(Base):
    __tablename__ = 'warehouse_transfers'
    id = Column(Integer, primary_key=True, index=True)
    from_warehouse_id = Column(Integer, ForeignKey('warehouses.id'), nullable=False)
    to_warehouse_id = Column(Integer, ForeignKey('warehouses.id'), nullable=False)
    product_id = Column(Integer, ForeignKey('products.id'), nullable=False)
    quantity = Column(Integer, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships (optional, for ORM navigation)
    from_warehouse = relationship('Warehouse', foreign_keys=[from_warehouse_id])
    to_warehouse = relationship('Warehouse', foreign_keys=[to_warehouse_id])
    product = relationship('Product')
