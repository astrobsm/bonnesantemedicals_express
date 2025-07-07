from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

class ProductionRequirement(Base):
    __tablename__ = 'production_requirements'
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey('products.id'), nullable=False)
    # Relationship to items
    items = relationship('ProductionRequirementItem', back_populates='production_requirement', cascade='all, delete-orphan')

class ProductionRequirementItem(Base):
    __tablename__ = 'production_requirement_items'
    id = Column(Integer, primary_key=True, index=True)
    production_requirement_id = Column(Integer, ForeignKey('production_requirements.id'), nullable=False)
    raw_material_id = Column(Integer, ForeignKey('raw_materials.id'), nullable=False)
    quantity = Column(Integer, nullable=False)
    # Relationships
    production_requirement = relationship('ProductionRequirement', back_populates='items')