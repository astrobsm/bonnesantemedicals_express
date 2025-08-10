"""
Simulation Authentication Service for SKIP_DATABASE mode
Provides mock authentication without database access
"""
import os
from typing import Optional, Dict, Any
from app.core.security import create_access_token, verify_password, get_password_hash

# Mock users for simulation mode
MOCK_USERS = {
    "admin": {
        "id": 1,
        "username": "admin",
        "password_hash": get_password_hash("admin123"),
        "role": "Admin",
        "status": "active",
        "email": "admin@astrobsm.com"
    },
    "manager": {
        "id": 2,
        "username": "manager",
        "password_hash": get_password_hash("manager123"),
        "role": "Manager",
        "status": "active",
        "email": "manager@astrobsm.com"
    },
    "employee": {
        "id": 3,
        "username": "employee",
        "password_hash": get_password_hash("employee123"),
        "role": "Employee",
        "status": "active",
        "email": "employee@astrobsm.com"
    }
}

class MockUser:
    """Mock user object that mimics SQLAlchemy User model"""
    def __init__(self, user_data: Dict[str, Any]):
        self.id = user_data["id"]
        self.username = user_data["username"]
        self.password_hash = user_data["password_hash"]
        self.role = user_data["role"]
        self.status = user_data["status"]
        self.email = user_data.get("email", f"{user_data['username']}@astrobsm.com")

def simulate_authenticate_user(username: str, password: str, role: str = None) -> Optional[MockUser]:
    """
    Simulate user authentication without database
    """
    if os.getenv("SKIP_DATABASE") != "true":
        return None
    
    print(f"[SIMULATION] Authenticating user: {username}, role: {role}")
    
    user_data = MOCK_USERS.get(username.lower())
    if not user_data:
        print(f"[SIMULATION] User not found: {username}")
        return None
    
    # Verify password
    if not verify_password(password, user_data["password_hash"]):
        print(f"[SIMULATION] Invalid password for user: {username}")
        return None
    
    # Check role if specified
    if role and user_data["role"].lower() != role.lower():
        print(f"[SIMULATION] Role mismatch for user: {username}. Expected: {role}, Got: {user_data['role']}")
        return None
    
    print(f"[SIMULATION] Authentication successful for: {username}")
    return MockUser(user_data)

def simulate_create_user(username: str, password: str, role: str) -> Optional[MockUser]:
    """
    Simulate user creation without database
    """
    if os.getenv("SKIP_DATABASE") != "true":
        return None
    
    print(f"[SIMULATION] Creating user: {username}, role: {role}")
    
    # Check if user already exists
    if username.lower() in MOCK_USERS:
        print(f"[SIMULATION] User already exists: {username}")
        return None
    
    # Create new mock user
    new_id = max(user["id"] for user in MOCK_USERS.values()) + 1
    user_data = {
        "id": new_id,
        "username": username,
        "password_hash": get_password_hash(password),
        "role": role,
        "status": "pending",
        "email": f"{username}@astrobsm.com"
    }
    
    # Add to mock users (for this session)
    MOCK_USERS[username.lower()] = user_data
    
    print(f"[SIMULATION] User created successfully: {username}")
    return MockUser(user_data)

def simulate_get_user_by_username(username: str) -> Optional[MockUser]:
    """
    Simulate getting user by username without database
    """
    if os.getenv("SKIP_DATABASE") != "true":
        return None
    
    user_data = MOCK_USERS.get(username.lower())
    if user_data:
        return MockUser(user_data)
    return None

def simulate_get_user_by_id(user_id: int) -> Optional[MockUser]:
    """
    Simulate getting user by ID without database
    """
    if os.getenv("SKIP_DATABASE") != "true":
        return None
    
    for user_data in MOCK_USERS.values():
        if user_data["id"] == user_id:
            return MockUser(user_data)
    return None

def get_simulation_credentials():
    """
    Get default simulation credentials for testing
    """
    return {
        "admin": {"username": "admin", "password": "admin123", "role": "Admin"},
        "manager": {"username": "manager", "password": "manager123", "role": "Manager"},
        "employee": {"username": "employee", "password": "employee123", "role": "Employee"}
    }
