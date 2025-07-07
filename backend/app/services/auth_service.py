from datetime import datetime, timedelta, timezone
from typing import Optional
from passlib.context import CryptContext
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.db.models.user import User
from app.schemas.auth import TokenData
from app.core.config import settings

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def get_current_user(db: Session, token: str) -> Optional[User]:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    user = db.query(User).filter(User.username == token_data.username).first()
    if user is None:
        raise credentials_exception
    return user

def create_user(db: Session, username: str, password: str, role: str = "user") -> User:
    """
    Create a new user in the database with a hashed password and role.

    Args:
        db (Session): The database session.
        username (str): The username of the new user.
        password (str): The plain text password of the new user.
        role (str): The role of the new user. Defaults to "user".

    Returns:
        User: The newly created user object.
    """
    hashed_password = get_password_hash(password)
    new_user = User(username=username, hashed_password=hashed_password, role=role, status="pending")
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

def authenticate_user(db: Session, username: str, password: str, role: str = None) -> Optional[User]:
    print(f"Authenticating user: username={username}, role={role}")
    user = db.query(User).filter(User.username == username).first()
    if not user:
        print(f"User not found in database: username={username}")
        return None

    print(f"User found: username={user.username}, role={user.role}, status={user.status}")

    if not verify_password(password, user.hashed_password):
        print(f"Password verification failed for user: username={username}")
        return None

    if role and user.role != role:
        print(f"Role mismatch for user: username={username}. Expected role={role}, Found role={user.role}")
        return None

    print(f"Authentication successful for user: username={username}, role={user.role}")
    return user

def create_user_profile(db: Session, full_name: str, email: str, phone: str, role: str):
    user = User(full_name=full_name, email=email, phone=phone, role=role, status="pending")
    db.add(user)
    db.commit()
    db.refresh(user)
    return user