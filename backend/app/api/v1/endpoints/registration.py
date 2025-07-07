from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.db import models
from app.db.session import get_db
from app.services.auth_service import create_user
from app.schemas import registration as schemas
from app.core.security import get_password_hash
from datetime import datetime
import uuid

router = APIRouter()

@router.post("/register")
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")

    new_user = models.User(
        username=user.username,
        hashed_password=get_password_hash(user.password),
        role=user.role,
        facial_scan_data=user.facial_scan_data,
        qr_code=user.qr_code,
        status="pending"  # Ensure status is always pending for new users
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User registered successfully", "user_id": new_user.id}

@router.post("/staff", response_model=schemas.User)
def register_staff(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    return create_user(user=user, db=db)

@router.post("/product", response_model=schemas.Product)
def register_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    print("DEBUG: Incoming product data:", product.dict())
    db_product = db.query(models.Product).filter(models.Product.name == product.name).first()
    if db_product:
        print("DEBUG: Product already registered:", db_product)
        raise HTTPException(status_code=400, detail="Product already registered")
    try:
        product_id = product.name.upper().replace(' ', '_')
        new_product = models.Product(
            name=product.name,
            product_id=product_id,
            description=product.description,
            unit_of_measure=product.uom,
            unit_price=product.unit_price,
            reorder_point=product.reorder_point,
            opening_stock_quantity=product.opening_stock,
            average_production_time=0
        )
        db.add(new_product)
        db.commit()
        db.refresh(new_product)
        print("DEBUG: Product registered successfully:", new_product)
        return new_product
    except Exception as e:
        print("DEBUG: Exception during product registration:", str(e))
        raise HTTPException(status_code=400, detail=f"Product registration failed: {str(e)}")

@router.post("/raw-material", response_model=schemas.RawMaterial)
def register_raw_material(raw_material: schemas.RawMaterialCreate, db: Session = Depends(get_db)):
    print("DEBUG: Incoming raw material data:", raw_material.dict())
    try:
        db_raw_material = db.query(models.RawMaterial).filter(models.RawMaterial.name == raw_material.name).first()
        if db_raw_material:
            print("DEBUG: Raw material already exists:", db_raw_material)
            raise HTTPException(status_code=400, detail="Raw material already registered")
        new_raw_material = models.RawMaterial(**raw_material.dict())
        db.add(new_raw_material)
        db.commit()
        db.refresh(new_raw_material)
        print("DEBUG: New raw material created:", new_raw_material)
        return new_raw_material
    except Exception as e:
        print("ERROR during raw material registration:", e)
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error during raw material registration: {e}")

@router.post("/customer", response_model=schemas.Customer)
def register_customer(customer: schemas.CustomerCreate, db: Session = Depends(get_db)):
    print("DEBUG: Incoming customer data:", customer.dict())
    db_customer = db.query(models.Customer).filter(models.Customer.name == customer.name).first()
    if db_customer:
        print("DEBUG: Customer already exists:", db_customer)
        raise HTTPException(status_code=400, detail="Customer already registered")
    try:
        customer_data = customer.dict()
        if not customer_data.get("customer_id"):
            customer_data["customer_id"] = str(uuid.uuid4())
        new_customer = models.Customer(**customer_data)
        db.add(new_customer)
        db.commit()
        db.refresh(new_customer)
        print("DEBUG: New customer created:", new_customer)
        return new_customer
    except Exception as e:
        print("ERROR during customer registration:", e)
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error during customer registration: {e}")

@router.post("/warehouse", response_model=schemas.Warehouse)
def register_warehouse(warehouse: schemas.WarehouseCreate, db: Session = Depends(get_db)):
    print("DEBUG: Incoming warehouse data:", warehouse.dict())
    try:
        db_warehouse = db.query(models.Warehouse).filter(models.Warehouse.name == warehouse.name).first()
        if db_warehouse:
            print("DEBUG: Warehouse already exists:", db_warehouse)
            raise HTTPException(status_code=400, detail="Warehouse already registered")
        new_warehouse = models.Warehouse(**warehouse.dict())
        db.add(new_warehouse)
        db.commit()
        db.refresh(new_warehouse)
        print("DEBUG: New warehouse created:", new_warehouse)
        return new_warehouse
    except Exception as e:
        print("ERROR during warehouse registration:", e)
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error during warehouse registration: {e}")

@router.post("/supplier", response_model=schemas.Supplier)
def register_supplier(supplier: schemas.SupplierCreate, db: Session = Depends(get_db)):
    print("DEBUG: Incoming supplier data:", supplier.dict())
    try:
        db_supplier = db.query(models.Supplier).filter(models.Supplier.name == supplier.name).first()
        if db_supplier:
            print("DEBUG: Supplier already exists:", db_supplier)
            raise HTTPException(status_code=400, detail="Supplier already registered")
        supplier_data = supplier.dict()
        if not supplier_data.get("supplier_id"):
            supplier_data["supplier_id"] = str(uuid.uuid4())
        new_supplier = models.Supplier(**supplier_data)
        db.add(new_supplier)
        db.commit()
        db.refresh(new_supplier)
        print("DEBUG: New supplier created:", new_supplier)
        return new_supplier
    except Exception as e:
        print("ERROR during supplier registration:", e)
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error during supplier registration: {e}")

@router.post("/distributor", response_model=schemas.Distributor)
def register_distributor(distributor: schemas.DistributorCreate, db: Session = Depends(get_db)):
    print("DEBUG: Incoming distributor data:", distributor.dict())
    try:
        db_distributor = db.query(models.Distributor).filter(models.Distributor.name == distributor.name).first()
        if db_distributor:
            print("DEBUG: Distributor already exists:", db_distributor)
            raise HTTPException(status_code=400, detail="Distributor already registered")
        distributor_data = distributor.dict()
        if not distributor_data.get("dist_id"):
            distributor_data["dist_id"] = str(uuid.uuid4())
        new_distributor = models.Distributor(**distributor_data)
        db.add(new_distributor)
        db.commit()
        db.refresh(new_distributor)
        print("DEBUG: New distributor created:", new_distributor)
        return new_distributor
    except Exception as e:
        print("ERROR during distributor registration:", e)
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Internal server error during distributor registration: {e}")

@router.post("/marketer", response_model=schemas.Marketer)
def register_marketer(marketer: schemas.MarketerCreate, db: Session = Depends(get_db)):
    db_marketer = db.query(models.Marketer).filter(models.Marketer.name == marketer.name).first()
    if db_marketer:
        raise HTTPException(status_code=400, detail="Marketer already registered")
    new_marketer = models.Marketer(**marketer.dict())
    db.add(new_marketer)
    db.commit()
    db.refresh(new_marketer)
    return new_marketer

@router.post("/staff-profile", response_model=schemas.StaffRegistration)
def register_staff_profile(staff: schemas.StaffRegistration, db: Session = Depends(get_db)):
    db_staff = db.query(models.Staff).filter(models.Staff.staff_id == staff.staff_id).first()
    if db_staff:
        raise HTTPException(status_code=400, detail="Staff already registered")
    dob_date = staff.dob
    if isinstance(dob_date, str):
        try:
            dob_date = datetime.strptime(staff.dob, "%Y-%m-%d").date()
        except Exception as e:
            print("DOB conversion error:", e)
            raise HTTPException(status_code=422, detail="Invalid date format for dob. Use YYYY-MM-DD.")
    try:
        new_staff = models.Staff(
            name=staff.name,
            staff_id=staff.staff_id,
            date_of_birth=dob_date,
            gender=staff.gender,
            phone_number=staff.phone,
            bank_name=staff.bank,
            account_number=staff.account_number,
            age=0,
            marital_status="",
            email="",
            next_of_kin_name="",
            next_of_kin_phone="",
        )
        db.add(new_staff)
        db.commit()
        db.refresh(new_staff)
        return staff
    except Exception as e:
        print("Staff registration error:", e)
        db.rollback()
        raise HTTPException(status_code=500, detail="Internal server error during staff registration.")