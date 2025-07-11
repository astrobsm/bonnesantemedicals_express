from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db.base import Base
from app.core.config import settings

# Use the DATABASE_URL from settings, which handles env and prefix fix
DATABASE_URL = settings.DATABASE_URL

# Enhanced engine configuration for production deployment
connect_args = {
    'connect_timeout': 30,
    'application_name': 'AstroBSM-Production'
}

# Add SSL configuration for DigitalOcean
if 'ondigitalocean.com' in DATABASE_URL:
    connect_args.update({
        'sslmode': 'require',
        'sslcert': None,
        'sslkey': None,
        'sslrootcert': None,
        'sslcrl': None
    })

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,
    pool_recycle=300,
    pool_timeout=30,
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