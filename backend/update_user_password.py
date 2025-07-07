# update_user_password.py
"""
Script to update the password for a given username in the production database.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db.models.user import User
from app.core.security import get_password_hash

DATABASE_URL = "postgresql://astrobsm:WttcHRFGuDdzcwFn5YtdcNodlshXJ3sT@dpg-d10a2i8gjchc73agp9a0-a.oregon-postgres.render.com/bonnesantemedical_db"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def update_password(username, new_password):
    session = SessionLocal()
    try:
        user = session.query(User).filter(User.username == username).first()
        if not user:
            print(f"User '{username}' not found.")
            return
        user.hashed_password = get_password_hash(new_password)
        session.commit()
        print(f"Password updated for user '{username}'.")
    except Exception as e:
        print(f"Error updating password: {e}")
        session.rollback()
    finally:
        session.close()

if __name__ == "__main__":
    update_password("blakvelvet", "chibuike_douglas")
