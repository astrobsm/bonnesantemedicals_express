from sqlalchemy import Column, Integer, String, Date, Float
from app.db.base import Base

class ProductionAnalysis(Base):
    __tablename__ = "production_analysis"

    id = Column(Integer, primary_key=True, index=True)
    product_name = Column(String, index=True, nullable=False)
    production_date = Column(Date, nullable=False)
    quantity_produced = Column(Float, nullable=False)
    remarks = Column(String, nullable=True)