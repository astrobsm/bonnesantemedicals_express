# Script to seed test data for all registration types
from app.db.session import SessionLocal
from app.db.models.user import User
from app.db.models.staff import Staff
from app.db.models.supplier import Supplier
from sqlalchemy.exc import IntegrityError
from app.services.auth_service import create_user

# Add more imports as needed for other models

def seed():
    db = SessionLocal()
    try:
        # Admin user
        if not db.query(User).filter_by(username="admin").first():
            create_user(db, username="admin", password="admin123", role="Admin")
            print("Admin user created.")
        else:
            print("Admin user already exists.")

        # Staff
        if not db.query(Staff).filter_by(staff_id="S-001").first():
            staff = Staff(
                name="Test Staff",
                staff_id="S-001",
                date_of_birth="1990-01-01",
                age=35,
                gender="Male",
                marital_status="Single",
                phone_number="1234567890",
                email="staff@example.com",
                next_of_kin_name="Kin Name",
                next_of_kin_phone="0987654321",
                bank_name="Test Bank",
                account_number="0001112223",
                address="123 Test St",
                hourly_rate=20.0,
                role="Engineer",
                department="Production",
                appointment_type="Full-Time"
            )
            db.add(staff)
            db.commit()
            print("Test staff created.")
        else:
            print("Test staff already exists.")

        # Supplier
        if not db.query(Supplier).filter_by(supplier_id="SUP-001").first():
            supplier = Supplier(
                name="Test Supplier",
                supplier_id="SUP-001",
                phone="555-1234",
                country="Testland",
                state="Teststate",
                phone_number="555-5678",
                address="456 Supplier Ave"
            )
            db.add(supplier)
            db.commit()
            print("Test supplier created.")
        else:
            print("Test supplier already exists.")

        # Add more test data for other models as needed

    except IntegrityError as e:
        db.rollback()
        print("IntegrityError:", e)
    finally:
        db.close()

if __name__ == "__main__":
    seed()
