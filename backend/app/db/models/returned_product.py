from sqlalchemy import Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

class ReturnedProduct(Base):
    __tablename__ = 'returned_products'

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey('products.id'), nullable=False)
    quantity = Column(Integer, nullable=False)
    batch_no = Column(String, nullable=True)
    manufacturing_date = Column(Date, nullable=True)
    expiry_date = Column(Date, nullable=True)
    date_of_return = Column(Date, nullable=False)
    reason = Column(String, nullable=False)
    customer_id = Column(Integer, ForeignKey('customers.id'), nullable=False)
    receiving_staff_id = Column(Integer, ForeignKey('staff.id'), nullable=False)

    product = relationship('Product')
    customer = relationship('Customer')
    receiving_staff = relationship('Staff')
