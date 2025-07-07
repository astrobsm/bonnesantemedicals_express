from sqlalchemy import Column, String, Integer, Float, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

class RawMaterial(Base):
    __tablename__ = 'raw_materials'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    rm_id = Column(String, unique=True, index=True)
    category = Column(String, nullable=False)
    source = Column(String, nullable=False)
    uom = Column(String, nullable=False)
    reorder_point = Column(Integer, nullable=False)
    unit_cost = Column(Float, nullable=False)
    opening_stock = Column(Integer, default=0)

    inventory_items = relationship("Inventory", back_populates="raw_material")
    stock_intakes = relationship("RawMaterialStockIntake", back_populates="raw_material")

class RawMaterialStockIntake(Base):
    __tablename__ = 'raw_material_stock_intake'

    id = Column(Integer, primary_key=True, index=True)
    raw_material_id = Column(Integer, ForeignKey('raw_materials.id'), nullable=False)
    quantity = Column(Integer, nullable=False)
    supplier_id = Column(Integer, ForeignKey('suppliers.id'), nullable=False)
    expiry_date = Column(Date, nullable=False)
    date_of_intake = Column(Date, nullable=False)
    intake_staff_id = Column(Integer, ForeignKey('staff.id'), nullable=False)
    batch_no = Column(String, nullable=True)
    unit_cost = Column(Float, nullable=True)
    uom = Column(String, nullable=True)
    category = Column(String, nullable=True)
    source = Column(String, nullable=True)
    reorder_point = Column(Integer, nullable=True)
    opening_stock = Column(Integer, nullable=True)

    raw_material = relationship("RawMaterial", back_populates="stock_intakes")