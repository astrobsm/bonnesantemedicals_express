#!/usr/bin/env python3
"""
Fix alembic_version.version_num column to support longer revision IDs
"""
import os
import sys
from sqlalchemy import create_engine, text
from app.core.config import settings

def fix_alembic_version_column():
    """Alter the alembic_version.version_num column to support longer revision IDs"""
    try:
        # Get database URL from environment
        database_url = settings.DATABASE_URL
        if not database_url:
            print("❌ DATABASE_URL not found in environment variables")
            return False
        
        print(f"🔌 Connecting to database...")
        engine = create_engine(database_url)
        
        with engine.connect() as conn:
            # Start a transaction
            trans = conn.begin()
            try:
                # Check if alembic_version table exists
                result = conn.execute(text("""
                    SELECT EXISTS (
                        SELECT FROM information_schema.tables 
                        WHERE table_name = 'alembic_version'
                    )
                """))
                table_exists = result.scalar()
                
                if not table_exists:
                    print("ℹ️  alembic_version table doesn't exist yet - this is normal for a fresh database")
                    trans.commit()
                    return True
                
                # Check current column definition
                result = conn.execute(text("""
                    SELECT character_maximum_length 
                    FROM information_schema.columns 
                    WHERE table_name = 'alembic_version' 
                    AND column_name = 'version_num'
                """))
                current_length = result.scalar()
                
                print(f"📏 Current version_num column length: {current_length}")
                
                if current_length and current_length >= 50:
                    print("✅ Column is already large enough")
                    trans.commit()
                    return True
                
                # Alter the column to support longer revision IDs
                print("🔧 Altering alembic_version.version_num column to VARCHAR(50)...")
                conn.execute(text("""
                    ALTER TABLE alembic_version 
                    ALTER COLUMN version_num TYPE VARCHAR(50)
                """))
                
                # Verify the change
                result = conn.execute(text("""
                    SELECT character_maximum_length 
                    FROM information_schema.columns 
                    WHERE table_name = 'alembic_version' 
                    AND column_name = 'version_num'
                """))
                new_length = result.scalar()
                
                print(f"✅ Column altered successfully. New length: {new_length}")
                trans.commit()
                return True
                
            except Exception as e:
                print(f"❌ Error during transaction: {e}")
                trans.rollback()
                return False
                
    except Exception as e:
        print(f"❌ Failed to fix alembic_version column: {e}")
        return False

if __name__ == "__main__":
    print("🔧 Fixing alembic_version column...")
    success = fix_alembic_version_column()
    if success:
        print("✅ alembic_version column fix completed successfully")
        sys.exit(0)
    else:
        print("❌ Failed to fix alembic_version column")
        sys.exit(1)
