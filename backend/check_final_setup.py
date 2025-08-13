#!/usr/bin/env python3
"""
Final verification that database setup is complete.
"""
import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select, text
import sys

# Add the app directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.db.models.user import User

# Use the provided credentials - convert to async URL
DATABASE_URL = "postgresql+asyncpg://doadmin:AVNS_IwToJq7-PA6XNU_1ZTv@astrobsmvelvet-db-do-user-23752526-0.e.db.ondigitalocean.com:25060/defaultdb?ssl=require"

async def check_database_setup():
    try:
        engine = create_async_engine(DATABASE_URL)
        SessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
        
        async with SessionLocal() as session:
            # Check connection
            result = await session.execute(text("SELECT version()"))
            version = result.scalar()
            print("✅ Database Connection Successful!")
            print(f"   PostgreSQL Version: {version}")
            
            # Check users table
            result = await session.execute(select(User))
            users = result.scalars().all()
            print(f"\n👥 Users in database: {len(users)}")
            for user in users:
                print(f"   - {user.username} ({user.role}) - Status: {user.status}")
            
            # Check table count
            result = await session.execute(text("""
                SELECT count(*) 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
            """))
            table_count = result.scalar()
            print(f"\n📊 Total tables in database: {table_count}")
            
            print("\n🎉 Database setup completed successfully!")
            print("   You can now start your application with the new database.")
            
    except Exception as e:
        print(f"❌ Error checking database: {e}")

if __name__ == "__main__":
    asyncio.run(check_database_setup())
