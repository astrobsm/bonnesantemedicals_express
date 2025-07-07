from sqlalchemy import Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import Session
from app.db.models.product import Product
from app.db.base import Base

class ProductStockIntake(Base):
    __tablename__ = 'product_stock_intake'

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey('products.id'), nullable=False)
    quantity = Column(Integer, nullable=False)
    date_of_intake = Column(Date, nullable=False)
    expiry_date = Column(Date, nullable=True)
    intake_staff_id = Column(Integer, ForeignKey('staff.id'), nullable=False)

def deduct_stock(db: Session, product_id: int, quantity: int):
    product = db.query(Product).filter(Product.id == product_id).first()
    if product and product.quantity >= quantity:
        product.quantity -= quantity
        db.commit()
        return True
    return False