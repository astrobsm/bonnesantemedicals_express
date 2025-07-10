#!/usr/bin/env python3
"""
Test database connection with enhanced error handling and SSL configuration.
"""

import os
import sys
import logging
from sqlalchemy import create_engine, text
from sqlalchemy.exc import OperationalError, ProgrammingError
import ssl

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_database_connection():
    """Test connection to the database with SSL support."""
    
    database_url = os.environ.get('DATABASE_URL')
    
    if not database_url:
        logger.error("❌ DATABASE_URL environment variable not set")
        return False
    
    # Log connection attempt (without password)
    safe_url = database_url.split('@')[1] if '@' in database_url else database_url
    logger.info(f"🔌 Testing connection to: {safe_url}")
    
    try:
        # Create engine with SSL configuration for DigitalOcean
        connect_args = {}
        if 'ondigitalocean.com' in database_url:
            connect_args = {
                'sslmode': 'require',
                'sslcert': None,
                'sslkey': None,
                'sslrootcert': None,
                'sslcrl': None
            }
        
        engine = create_engine(
            database_url,
            connect_args=connect_args,
            pool_pre_ping=True,
            pool_recycle=300
        )
        
        # Test connection
        with engine.connect() as connection:
            result = connection.execute(text("SELECT version();"))
            version = result.fetchone()[0]
            
            logger.info("✅ Database connection successful!")
            logger.info(f"📊 PostgreSQL Version: {version}")
            
            # Test if we can create tables
            try:
                connection.execute(text("SELECT 1;"))
                logger.info("✅ Database queries working")
            except Exception as e:
                logger.warning(f"⚠️  Query test failed: {e}")
            
            return True
            
    except OperationalError as e:
        logger.error(f"❌ Database connection failed (Operational): {e}")
        logger.info("💡 Check: DATABASE_URL format, network connectivity, SSL settings")
        return False
        
    except ProgrammingError as e:
        logger.error(f"❌ Database connection failed (Programming): {e}")
        logger.info("💡 Check: Database permissions, SQL syntax")
        return False
        
    except Exception as e:
        logger.error(f"❌ Unexpected database error: {e}")
        logger.info(f"💡 Error type: {type(e).__name__}")
        return False

if __name__ == "__main__":
    logger.info("🧪 Starting database connection test...")
    success = test_database_connection()
    
    if success:
        logger.info("🎉 Database test completed successfully")
        sys.exit(0)
    else:
        logger.error("💥 Database test failed")
        sys.exit(1)
