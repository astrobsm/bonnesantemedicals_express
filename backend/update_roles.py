from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.db.models.user import User
from app.services.auth_service import get_password_hash

def update_user_roles():
    db: Session = SessionLocal()

    # Define users and their roles
    users = [
        {"username": "sales_user", "password": "password123", "role": "sales", "status": "approved"},
        {"username": "manager_user", "password": "password123", "role": "manager", "status": "approved"},
        {"username": "production_manager_user", "password": "password123", "role": "production_manager", "status": "approved"},
        {"username": "marketing_user", "password": "password123", "role": "marketing", "status": "approved"},
    ]

    for user_data in users:
        user = db.query(User).filter(User.username == user_data["username"]).first()
        if user:
            user.role = user_data["role"]
            user.status = user_data["status"]
            print(f"Updated user '{user.username}' with role '{user.role}' and status '{user.status}'.")
        else:
            # Create the user if not found
            hashed_password = get_password_hash(user_data["password"])
            new_user = User(username=user_data["username"], hashed_password=hashed_password, role=user_data["role"], status=user_data["status"])
            db.add(new_user)
            print(f"Created new user '{new_user.username}' with role '{new_user.role}' and status '{new_user.status}'.")

    db.commit()

if __name__ == "__main__":
    update_user_roles()
