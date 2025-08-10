from sqlalchemy import create_engine

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from app.db.base import Base
from app.core.config import settings
import re
import ssl
import os

# Check if database should be skipped
SKIP_DATABASE = os.getenv("SKIP_DATABASE", "false").lower() == "true"

# Use the DATABASE_URL from settings, which handles env and prefix fix
DATABASE_URL = settings.DATABASE_URL

# Mock session for when database is skipped
class MockSession:
    def query(self, *args, **kwargs):
        return MockQuery()
    
    def add(self, *args, **kwargs):
        pass
    
    def commit(self, *args, **kwargs):
        pass
    
    def rollback(self, *args, **kwargs):
        pass
    
    def close(self, *args, **kwargs):
        pass
    
    def refresh(self, *args, **kwargs):
        pass

class MockQuery:
    def filter(self, *args, **kwargs):
        return self
    
    def first(self, *args, **kwargs):
        return None
    
    def all(self, *args, **kwargs):
        return []
    
    def count(self, *args, **kwargs):
        return 0

if not SKIP_DATABASE:
    # Remove sslmode from URL if present (asyncpg does not support it in URL)
    if 'ondigitalocean.com' in DATABASE_URL and 'asyncpg' in DATABASE_URL:
        DATABASE_URL = re.sub(r'[?&]sslmode=require', '', DATABASE_URL)

    # Async engine and session setup
    if 'asyncpg' in DATABASE_URL:
        connect_args = {"ssl": ssl.create_default_context()}
        engine = create_async_engine(
            DATABASE_URL,
            connect_args=connect_args,
            pool_pre_ping=True,
            pool_recycle=1800,
            pool_timeout=60,
            pool_size=10,
            max_overflow=20,
            echo=settings.DEBUG
        )
        AsyncSessionLocal = async_sessionmaker(
            bind=engine,
            expire_on_commit=False,
            class_=AsyncSession
        )
    else:
        from sqlalchemy import create_engine
        from sqlalchemy.orm import sessionmaker
        connect_args = {
            'connect_timeout': 20,
            'application_name': 'AstroBSM-Production',
            'options': '-c statement_timeout=30000'
        }
        engine = create_engine(
            DATABASE_URL,
            connect_args=connect_args,
            pool_pre_ping=True,
            pool_recycle=1800,
            pool_timeout=60,
            pool_size=10,
            max_overflow=20,
            echo=settings.DEBUG
        )
        AsyncSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dependency injection for database session
def get_db():
    """Database session dependency with SKIP_DATABASE support."""
    if SKIP_DATABASE:
        # Return mock session when database is skipped
        yield MockSession()
        return
    
    if 'asyncpg' in DATABASE_URL:
        # For async databases, we need a sync wrapper
        import asyncio
        from sqlalchemy import create_engine
        from sqlalchemy.orm import sessionmaker
        
        # Create synchronous engine for async database
        sync_url = DATABASE_URL.replace('postgresql+asyncpg://', 'postgresql://')
        sync_engine = create_engine(
            sync_url,
            connect_args={"sslmode": "require"} if 'ondigitalocean.com' in sync_url else {},
            pool_pre_ping=True,
            pool_recycle=1800,
            pool_timeout=60,
            pool_size=10,
            max_overflow=20,
            echo=settings.DEBUG
        )
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=sync_engine)
        db = SessionLocal()
    else:
        db = AsyncSessionLocal()
    
    try:
        yield db
    finally:
        db.close()