from pydantic import BaseModel
from typing import Optional

class LoginRequest(BaseModel):
    username: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str
    role: str

class UserCreate(BaseModel):
    username: str
    password: str
    role: str

class ProfileCreate(BaseModel):
    full_name: str
    email: str
    phone: str
    role: str

class UserResponse(BaseModel):
    username: str
    role: str
    profile_completed: bool  # Include profile completion status

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str
    role: Optional[str] = None