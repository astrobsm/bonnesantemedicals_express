from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db.models.user import User

DATABASE_URL = "postgresql+psycopg2://postgres:natiss_natiss@localhost/astrobsm_oracle"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

db = SessionLocal()

user = db.query(User).filter(User.username == "blakvelvet").first()
if user:
    print(f"User found: {user.username}, Role: {user.role}")
else:
    print("User not found.")