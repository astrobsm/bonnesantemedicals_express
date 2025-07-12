from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db.base import Base
from app.core.config import settings

# Use the DATABASE_URL from settings, which handles env and prefix fix
DATABASE_URL = settings.DATABASE_URL

# Enhanced engine configuration for production deployment with better timeouts
connect_args = {
    'connect_timeout': 20,  # Reduced from 30 to 20 seconds
    'application_name': 'AstroBSM-Production',
    'options': '-c statement_timeout=30000'  # 30 second statement timeout
}

# Add SSL configuration for DigitalOcean
if 'ondigitalocean.com' in DATABASE_URL:
    connect_args.update({
        'sslmode': 'require'
    })
    
    # Ensure sslmode=require is in URL if not present
    if 'sslmode=' not in DATABASE_URL:
        separator = '&' if '?' in DATABASE_URL else '?'
        DATABASE_URL = f"{DATABASE_URL}{separator}sslmode=require"

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,  # Test connections before use
    pool_recycle=1800,   # Recycle connections every 30 minutes (was 5 min)
    pool_timeout=60,     # Wait up to 60 seconds for connection from pool
    pool_size=10,
    max_overflow=20,
    echo=settings.DEBUG  # Log SQL in debug mode
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()