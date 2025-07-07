# create_admin_user.py
"""
Script to create the admin user 'blakvelvet' with password 'chibuike_douglas' and status 'active'.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db.models.user import User
from app.core.security import get_password_hash

DATABASE_URL = "postgresql://astrobsm:WttcHRFGuDdzcwFn5YtdcNodlshXJ3sT@dpg-d10a2i8gjchc73agp9a0-a.oregon-postgres.render.com/bonnesantemedical_db"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def create_admin():
    session = SessionLocal()
    try:
        user = session.query(User).filter(User.username == "blakvelvet").first()
        if user:
            print("User 'blakvelvet' already exists.")
            return
        new_user = User(
            username="blakvelvet",
            hashed_password=get_password_hash("chibuike_douglas"),
            role="Admin",
            status="active"
        )
        session.add(new_user)
        session.commit()
        print("Admin user 'blakvelvet' created with password 'chibuike_douglas'.")
    except Exception as e:
        print(f"Error: {e}")
        session.rollback()
    finally:
        session.close()

if __name__ == "__main__":
    create_admin()
