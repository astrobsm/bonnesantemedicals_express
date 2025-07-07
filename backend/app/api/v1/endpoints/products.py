from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models.inventory import Product

router = APIRouter()

@router.get("/")
def get_products(db: Session = Depends(get_db)):
    products = db.query(Product).all()
    if not products:
        raise HTTPException(status_code=404, detail="No products found")
    return [
        {
            "id": p.id,
            "name": p.name,
            "product_id": p.product_id,
            "description": p.description,
            "uom": p.unit_of_measure,  # FIXED: use correct model field
            "source": p.source if hasattr(p, 'source') else None,
            "unit_price": p.unit_price,
            "reorder_point": p.reorder_point,
            "opening_stock": p.opening_stock_quantity  # FIXED: use correct model field
        }
        for p in products
    ]

@router.get("", include_in_schema=False)
def get_products_no_slash(db: Session = Depends(get_db)):
    return get_products(db)
