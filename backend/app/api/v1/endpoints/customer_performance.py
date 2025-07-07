from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.session import get_db
from app.db.models.invoice import Invoice
from app.db.models.customer import Customer
from typing import List

router = APIRouter()

@router.get("/", response_model=List[dict])
def get_customer_performance(db: Session = Depends(get_db)):
    # Get all customers
    customers = db.query(Customer).all()
    # Get invoice aggregates per customer name
    invoice_agg = {
        r.name: {
            'totalTransactions': r.totalTransactions,
            'totalAmount': float(r.totalAmount)
        }
        for r in db.query(
            Customer.name.label('name'),
            func.count(Invoice.id).label('totalTransactions'),
            func.coalesce(func.sum(Invoice.total_amount), 0).label('totalAmount')
        ).join(Invoice, Invoice.customer_name == Customer.name, isouter=True)
         .group_by(Customer.name)
         .all()
    }
    # Build result for all customers, even those with no transactions
    result = []
    for c in customers:
        agg = invoice_agg.get(c.name, {'totalTransactions': 0, 'totalAmount': 0.0})
        result.append({
            'id': c.id,
            'name': c.name,
            'totalTransactions': agg['totalTransactions'],
            'totalAmount': agg['totalAmount']
        })
    return result

@router.get("", response_model=List[dict], include_in_schema=False)
def get_customer_performance_no_slash(db: Session = Depends(get_db)):
    return get_customer_performance(db)
