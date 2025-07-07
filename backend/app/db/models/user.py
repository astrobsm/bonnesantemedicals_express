from sqlalchemy import Column, Integer, String, LargeBinary, Boolean
from sqlalchemy.orm import relationship
from app.db.base import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False)  # Role: admin, sales, production
    facial_scan_data = Column(LargeBinary, nullable=True)
    qr_code = Column(String, nullable=True)
    status = Column(String, default="pending")  # Account approval status
    profile_completed = Column(Boolean, default=False)  # New column to track profile completion
    full_name = Column(String, nullable=True)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)

    # Correct the reverse relationship
    payroll_records = relationship("PayrollRecord", back_populates="user")
    payrolls = relationship("Payroll", back_populates="staff")
    activities = relationship("UserActivity", back_populates="user")

    def __repr__(self):
        return f"<User(id={self.id}, username={self.username}, role={self.role})>"