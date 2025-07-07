from sqlalchemy import Column, String, Integer
from app.db.base import Base

class Warehouse(Base):
    __tablename__ = 'warehouses'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    location = Column(String, nullable=False)
    manager = Column(String, nullable=True)
    manager_phone = Column(String, nullable=False)
    wh_id = Column(String, unique=True, nullable=True)
    manager_name = Column(String, nullable=True)
    date_created = Column(String, nullable=True)