from sqlalchemy import Column, Integer, Float, Date
from app.db.base import Base

class SalesSummary(Base):
    __tablename__ = 'sales_summary'

    id = Column(Integer, primary_key=True, index=True)
    total_sales = Column(Float, nullable=False)
    total_vat = Column(Float, nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)