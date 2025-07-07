from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.auth import UserCreate, UserResponse, ProfileCreate  # Import the missing schema
from app.services.auth_service import (
    create_user,
    authenticate_user,
    create_user_profile,
    get_current_user as service_get_current_user,
)  # Import the missing function
from app.core.security import create_access_token, get_password_hash
from app.db.models.user import User
from app.utils.pdf_utils import generate_credentials_pdf
import random
import string
from fastapi.responses import Response
from fastapi.security import OAuth2PasswordBearer

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)


def get_current_user(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    if not token:
        print("[DEBUG] No token provided!")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing authentication token")
    print(f"[DEBUG] Incoming token: {token}")
    user = service_get_current_user(db, token)
    if not user:
        print("[DEBUG] No user found for token!")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication credentials")
    print(f"[DEBUG] Authenticated user: {user.username if hasattr(user, 'username') else user}")
    return user


@router.post("/register", response_model=UserResponse)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = create_user(db, username=user.username, password=user.password, role=user.role)
    if db_user is None:
        raise HTTPException(status_code=400, detail="User already registered")
    db_user.status = "pending"  # Set status to pending for new users
    db.commit()
    return db_user


@router.post("/login")
def login(user: UserCreate, db: Session = Depends(get_db)):
    print(f"Login attempt: username={user.username}, password={user.password}, role={user.role}")
    db_user = authenticate_user(db, user.username, user.password, user.role)
    if not db_user:
        print("Login failed: Invalid credentials or role")
        raise HTTPException(status_code=400, detail="Invalid credentials or role")

    # Bypass pending status check for admin users
    if db_user.status == "pending" and db_user.role != "Admin":
        raise HTTPException(status_code=403, detail="Account approval pending. Please contact the admin.")

    print(f"Login successful: username={db_user.username}, role={db_user.role}")
    access_token = create_access_token(data={
        "sub": db_user.username,
        "user_id": db_user.id,
        "role": db_user.role
    })
    return {"access_token": access_token, "token_type": "bearer"}



@router.get("/user/me")
def get_current_user_info(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Admins get all warehouses, others get only their assigned ones
    warehouses = []
    if current_user.role and current_user.role.lower() == 'admin':
        from app.db.models.warehouse import Warehouse
        warehouses = [w.id for w in db.query(Warehouse).all()]
    else:
        try:
            from app.db.models.user_access import UserWarehouseAccess
            warehouses = [wa.warehouse_id for wa in db.query(UserWarehouseAccess).filter_by(user_id=current_user.id).all()]
        except Exception:
            pass
    return {
        "id": current_user.id,
        "username": current_user.username,
        "role": current_user.role,
        "status": current_user.status,
        "warehouses": warehouses
    }

@router.get("/user/{user_id}")
def get_user_data(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "username": user.username,
        "role": user.role,
        "facial_scan_data": user.facial_scan_data,
        "qr_code": user.qr_code,
    }


@router.get("/pending-users")
def get_pending_users(db: Session = Depends(get_db)):
    users = db.query(User).filter(User.status == "pending").all()
    return [
        {
            "id": u.id,
            "full_name": getattr(u, "full_name", None),
            "username": u.username,
            "email": getattr(u, "email", None),
            "phone": getattr(u, "phone", None),
            "role": u.role,
            "status": u.status,
        }
        for u in users
    ]


@router.post("/approve-user/{user_id}")
def approve_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    # Generate unique 6-letter username and 4-digit password
    username = "".join(random.choices(string.ascii_lowercase, k=6))
    password = "".join(random.choices(string.digits, k=4))
    from app.core.security import get_password_hash

    user.username = username
    user.hashed_password = get_password_hash(password)
    user.status = "active"
    db.commit()
    # Generate PDF
    pdf_bytes = generate_credentials_pdf(username, password, user.role)
    return Response(
        pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=credentials_user_{user.id}.pdf"},
    )


@router.post("/create-profile")
def create_profile(profile: ProfileCreate, db: Session = Depends(get_db)):
    # Only allow non-admin roles to create a profile
    if profile.role == "Admin":
        raise HTTPException(status_code=403, detail="Admin cannot create profile this way.")
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == profile.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="A user with this email already exists.")
    # Create a new user with status 'pending' and no credentials yet
    new_user = User(
        username=profile.email,  # Use email as username for pending users
        hashed_password="",  # No password until approved
        role=profile.role,
        status="pending",
        profile_completed=False,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "Profile created. Awaiting admin approval."}


@router.post("/admin/create-admin")
def create_admin_user_api(db: Session = Depends(get_db)):
    username = "blakvelvet"
    password = "chibuike_douglas"
    role = "Admin"
    status = "active"
    user = db.query(User).filter(User.username == username).first()
    if user:
        return {"message": f"User '{username}' already exists."}
    new_user = User(
        username=username,
        hashed_password=get_password_hash(password),
        role=role,
        status=status,
    )
    db.add(new_user)
    db.commit()
    return {"message": f"Admin user '{username}' created with password '{password}'."}


@router.post("/admin/reset-admin")
def reset_admin_user_api(db: Session = Depends(get_db)):
    username = "blakvelvet"
    password = "chibuike_douglas"
    user = db.query(User).filter(User.username == username).first()
    if not user:
        return {"message": f"User '{username}' not found."}
    user.hashed_password = get_password_hash(password)
    user.status = "active"
    db.commit()
    return {"message": f"Admin user '{username}' password reset and status set to active."}


@router.get("/list-users")
def list_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return [
        {
            "id": u.id,
            "username": u.username,
            "role": u.role,
            "status": u.status,
            "email": getattr(u, "email", None),
            "full_name": getattr(u, "full_name", None),
        }
        for u in users
    ]


@router.get("/user/me")
def get_current_user_info(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Admins get all warehouses, others get only their assigned ones
    warehouses = []
    if current_user.role and current_user.role.lower() == 'admin':
        from app.db.models.warehouse import Warehouse
        warehouses = [w.id for w in db.query(Warehouse).all()]
    else:
        try:
            from app.db.models.user_access import UserWarehouseAccess
            warehouses = [wa.warehouse_id for wa in db.query(UserWarehouseAccess).filter_by(user_id=current_user.id).all()]
        except Exception:
            pass
    return {
        "id": current_user.id,
        "username": current_user.username,
        "role": current_user.role,
        "status": current_user.status,
        "warehouses": warehouses
    }