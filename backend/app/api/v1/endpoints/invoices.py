from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models.invoice import Invoice
from app.schemas.invoices import InvoiceOut, InvoiceCreate
from typing import List
from datetime import date
from app.db.models.inventory import Inventory
from app.db.models.product import Product
from app.db.models.invoice import InvoiceItem
from app.api.v1.endpoints.auth import get_current_user
from app.db.models.user_access import UserWarehouseAccess

router = APIRouter()

@router.get("/", response_model=List[InvoiceOut])
def get_invoices(db: Session = Depends(get_db)):
    invoices = db.query(Invoice).all()
    return [InvoiceOut.model_validate(inv).model_dump() for inv in invoices]

@router.post("/", response_model=InvoiceOut)
def create_invoice(invoice: InvoiceCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    # Check user warehouse access
    access = db.query(UserWarehouseAccess).filter_by(user_id=current_user.id, warehouse_id=invoice.warehouse_id).first()
    if not access:
        raise HTTPException(status_code=403, detail="You do not have access to this warehouse.")
    # Check and deduct stock for each item from the selected warehouse only
    for item in invoice.items:
        inv = db.query(Inventory).filter(Inventory.product_id == item.product_id, Inventory.warehouse_id == invoice.warehouse_id).first()
        if not inv or inv.quantity < item.quantity:
            raise HTTPException(status_code=400, detail=f"Insufficient product in selected warehouse: Product ID {item.product_id}")
        inv.quantity -= item.quantity
        db.add(inv)
    # After deduction, update product status for this warehouse
    for item in invoice.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        total_available = sum(inv.quantity for inv in db.query(Inventory).filter(Inventory.product_id == item.product_id))
        if total_available > product.reorder_point:
            status = "Green"
        elif total_available == product.reorder_point:
            status = "Amber"
        else:
            status = "Red"
        product.status = status
        db.add(product)
    # Create invoice and items
    db_invoice = Invoice(
        invoice_number=invoice.invoice_number,
        customer_name=invoice.customer_name,
        date=invoice.date,
        total_amount=invoice.total_amount,
        status=invoice.status,
        logo_url=getattr(invoice, 'logo_url', None),
        pdf_url=getattr(invoice, 'pdf_url', None)
    )
    db.add(db_invoice)
    db.commit()
    db.refresh(db_invoice)
    # Add invoice items
    for item in invoice.items:
        db_item = InvoiceItem(
            invoice_id=db_invoice.id,
            product_id=item.product_id,
            quantity=item.quantity,
            price=item.price
        )
        db.add(db_item)
    db.commit()
    return InvoiceOut.model_validate(db_invoice).model_dump()
