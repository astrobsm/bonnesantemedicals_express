from sqlalchemy import Column, String, Integer
from app.db.base import Base

class Marketer(Base):
    __tablename__ = 'marketer'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    mark_id = Column(String, unique=True, nullable=False)
    phone = Column(String, nullable=False)
    coverage = Column(String, nullable=True)
    address = Column(String, nullable=True)
    email = Column(String, nullable=True)