from sqlalchemy import Column, String, Integer
from app.db.base import Base

class Distributor(Base):
    __tablename__ = 'distributor'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    dist_id = Column(String, unique=True, nullable=False)
    phone = Column(String, nullable=True)
    coverage = Column(String, nullable=True)
    address = Column(String, nullable=True)