from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.db.models.inventory import Product
from app.db.models.raw_material import RawMaterial
from app.db.models.customer import Customer
from app.db.models.supplier import Supplier
from app.db.models.distributor import Distributor
from app.db.models.staff import Staff
from app.db.models.marketer import Marketer
from datetime import date

def seed():
    db: Session = SessionLocal()
    try:
        # Add Product
        if not db.query(Product).first():
            product = Product(name='Sample Product', product_id='P001', description='Test product', uom='pcs', source='factory', unit_price=100.0, reorder_point=10, opening_stock=50)
            db.add(product)
        # Add Raw Material
        if not db.query(RawMaterial).first():
            raw_material = RawMaterial(name='Sample Raw Material', rm_id='RM001', category='General', source='import', uom='kg', reorder_point=20, unit_cost=10.0, opening_stock=100)
            db.add(raw_material)
        # Add Customer
        if not db.query(Customer).first():
            customer = Customer(name='Test Customer', company='Test Co', phone='1234567890', email='customer@test.com', address='123 Test St')
            db.add(customer)
        # Add Supplier
        if not db.query(Supplier).first():
            supplier = Supplier(name='Test Supplier', phone='0987654321', email='supplier@test.com', address='456 Supplier Ave')
            db.add(supplier)
        # Add Distributor
        if not db.query(Distributor).first():
            distributor = Distributor(name='Test Distributor', distributor_id='D001', region='North', phone_number='1112223333', email='distributor@test.com')
            db.add(distributor)
        # Add Staff
        if not db.query(Staff).first():
            staff = Staff(name='Test Staff', role='Manager', phone='2223334444', email='staff@test.com')
            db.add(staff)
        # Add Marketer
        if not db.query(Marketer).first():
            marketer = Marketer(name='Test Marketer', mark_id='M001', phone='3334445555', coverage='Region1', address='789 Marketer Rd', email='marketer@test.com')
            db.add(marketer)
        db.commit()
        print('Seed data added successfully.')
    except Exception as e:
        db.rollback()
        print('Error seeding data:', e)
    finally:
        db.close()

if __name__ == '__main__':
    seed()
