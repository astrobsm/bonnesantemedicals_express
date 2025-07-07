from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models.customer import Customer
import traceback  # Add this to print full errors

router = APIRouter()

@router.get("/")
def get_customers(db: Session = Depends(get_db)):
    try:
        customers = db.query(Customer).all()
        return [
            {
                "id": c.id,
                "name": c.name,
                "customer_id": c.customer_id,
                "phone": c.phone,  # Ensure phone number is included
                "address": c.address,
                "company": c.company
            }
            for c in customers
        ]
    except Exception as e:
        print("❌ ERROR fetching customers:")
        traceback.print_exc()  # 👈 This prints the full stack trace in the terminal
        raise HTTPException(status_code=500, detail="Internal Server Error")

@router.get("", include_in_schema=False)
def get_customers_no_slash(db: Session = Depends(get_db)):
    return get_customers(db)
