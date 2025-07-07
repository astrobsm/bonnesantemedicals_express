from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.db.base import Base
from datetime import datetime

class Invoice(Base):
    __tablename__ = 'invoices'

    id = Column(Integer, primary_key=True, index=True)
    invoice_number = Column(String, nullable=False, unique=True)
    customer_name = Column(String, nullable=False)
    total_amount = Column(Float, nullable=False)
    vat = Column(Float, default=7.5)
    status = Column(String, default='unpaid')
    created_at = Column(DateTime, default=datetime.utcnow)
    date = Column(DateTime, nullable=False, default=datetime.utcnow)
    logo_url = Column(String, nullable=True)
    pdf_url = Column(String, nullable=True)

    items = relationship("InvoiceItem", back_populates="invoice")

class InvoiceItem(Base):
    __tablename__ = 'invoice_items'

    id = Column(Integer, primary_key=True, index=True)
    invoice_id = Column(Integer, ForeignKey('invoices.id'))
    product_id = Column(Integer, ForeignKey('products.id'))
    quantity = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)

    invoice = relationship("Invoice", back_populates="items")
    product = relationship("Product")