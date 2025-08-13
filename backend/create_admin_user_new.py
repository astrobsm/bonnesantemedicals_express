#!/usr/bin/env python3
"""
Create an admin user for the system.
"""
import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from passlib.context import CryptContext
import sys
import traceback

# Add the app directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.db.models.user import User

# Use the provided credentials - convert to async URL
DATABASE_URL = "postgresql+asyncpg://doadmin:AVNS_IwToJq7-PA6XNU_1ZTv@astrobsmvelvet-db-do-user-23752526-0.e.db.ondigitalocean.com:25060/defaultdb?ssl=require"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def create_admin_user():
    try:
        engine = create_async_engine(DATABASE_URL)
        SessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
        
        async with SessionLocal() as session:
            # Check if admin user already exists
            result = await session.execute(select(User).where(User.username == "admin"))
            existing_user = result.scalar_one_or_none()
            
            if existing_user:
                print("✅ Admin user already exists!")
                print(f"   Username: {existing_user.username}")
                print(f"   Role: {existing_user.role}")
                print(f"   Status: {existing_user.status}")
                return
            
            # Create new admin user
            hashed_password = pwd_context.hash("admin123")  # Default password
            admin_user = User(
                username="admin",
                email="admin@astrobsm.com",
                hashed_password=hashed_password,
                role="admin",
                status="approved",  # Set status to approved
                profile_completed=True,
                full_name="System Administrator"
            )
            
            session.add(admin_user)
            await session.commit()
            await session.refresh(admin_user)
            
            print("✅ Admin user created successfully!")
            print(f"   Username: admin")
            print(f"   Password: admin123")
            print(f"   Email: admin@astrobsm.com")
            print(f"   Role: admin")
            print("   Please change the password after first login!")
            
    except Exception as e:
        print(f"❌ Error creating admin user: {e}")
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(create_admin_user())
