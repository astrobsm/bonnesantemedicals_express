from sqlalchemy import Column, Integer, ForeignKey, String, UniqueConstraint
from app.db.base import Base

class UserWarehouseAccess(Base):
    __tablename__ = 'user_warehouse_access'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    warehouse_id = Column(Integer, ForeignKey('warehouses.id'), nullable=False)
    __table_args__ = (UniqueConstraint('user_id', 'warehouse_id', name='_user_warehouse_uc'),)

class UserSectionAccess(Base):
    __tablename__ = 'user_section_access'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    section_name = Column(String, nullable=False)
    __table_args__ = (UniqueConstraint('user_id', 'section_name', name='_user_section_uc'),)
