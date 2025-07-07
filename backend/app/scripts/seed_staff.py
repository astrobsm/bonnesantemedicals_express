from app.db.session import SessionLocal
from app.db.models.staff import Staff
from datetime import date

def seed_staff():
    db = SessionLocal()
    staff_list = [
        Staff(
            name="John Doe",
            staff_id="STF001",
            date_of_birth=date(1990, 1, 1),
            age=35,
            gender="Male",
            marital_status="Single",
            phone_number="08012345678",
            email="john.doe@example.com",
            next_of_kin_name="Jane Doe",
            next_of_kin_phone="08087654321",
            bank_name="Access Bank",
            account_number="1234567890"
        ),
        Staff(
            name="Mary Smith",
            staff_id="STF002",
            date_of_birth=date(1988, 5, 15),
            age=37,
            gender="Female",
            marital_status="Married",
            phone_number="08023456789",
            email="mary.smith@example.com",
            next_of_kin_name="Paul Smith",
            next_of_kin_phone="08098765432",
            bank_name="GTBank",
            account_number="0987654321"
        )
    ]
    for staff in staff_list:
        db.add(staff)
    db.commit()
    db.close()

if __name__ == "__main__":
    seed_staff()
