#!/usr/bin/env python3
"""
Comprehensive deployment status checker for AstroBSM-Oracle-IVANSTAMAS
This script helps diagnose deployment issues
"""

import os
import sys
import logging
import json
from datetime import datetime
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger(__name__)

def check_environment_variables():
    """Check for required environment variables"""
    logger.info("🔧 ENVIRONMENT VARIABLES CHECK")
    logger.info("=" * 50)
    
    required_vars = ['DATABASE_URL', 'SECRET_KEY']
    optional_vars = ['ENVIRONMENT', 'PORT', 'DEBUG']
    
    for var in required_vars:
        value = os.environ.get(var)
        if value:
            # Don't log sensitive values, just confirm they exist
            if var == 'DATABASE_URL':
                safe_url = value.split('@')[1] if '@' in value else "***"
                logger.info(f"✅ {var}: Connected to {safe_url}")
            elif var == 'SECRET_KEY':
                logger.info(f"✅ {var}: Set (length: {len(value)})")
            else:
                logger.info(f"✅ {var}: {value}")
        else:
            logger.info(f"❌ {var}: NOT SET")
    
    for var in optional_vars:
        value = os.environ.get(var)
        if value:
            logger.info(f"ℹ️  {var}: {value}")
        else:
            logger.info(f"⚠️  {var}: Not set (using default)")
    
    logger.info("")

def check_static_files():
    """Check if React build files exist"""
    logger.info("📁 STATIC FILES CHECK")
    logger.info("=" * 50)
    
    static_path = Path("app/static")
    
    if static_path.exists():
        files = list(static_path.rglob("*"))
        logger.info(f"✅ Static directory exists: {static_path.absolute()}")
        logger.info(f"📂 Total files: {len([f for f in files if f.is_file()])}")
        
        # Check for key files
        key_files = ['index.html', 'asset-manifest.json']
        for key_file in key_files:
            if (static_path / key_file).exists():
                logger.info(f"✅ {key_file}: Found")
            else:
                logger.info(f"❌ {key_file}: Missing")
        
        # List first 10 files
        file_list = [f for f in files if f.is_file()][:10]
        if file_list:
            logger.info("📋 Sample files:")
            for f in file_list:
                rel_path = f.relative_to(static_path)
                logger.info(f"   - {rel_path}")
    else:
        logger.info(f"❌ Static directory not found: {static_path.absolute()}")
    
    logger.info("")

def check_database_connection():
    """Test database connectivity"""
    logger.info("🔌 DATABASE CONNECTION CHECK")
    logger.info("=" * 50)
    
    try:
        from sqlalchemy import create_engine, text
        
        database_url = os.environ.get('DATABASE_URL')
        if not database_url:
            logger.info("❌ DATABASE_URL not set")
            return False
        
        # Create engine with connection timeout
        engine = create_engine(database_url, connect_args={"connect_timeout": 10})
        
        with engine.connect() as conn:
            result = conn.execute(text("SELECT version()"))
            version = result.fetchone()[0]
            logger.info(f"✅ Database connected: {version[:50]}...")
            
            # Check if alembic_version table exists
            try:
                result = conn.execute(text("SELECT version_num FROM alembic_version ORDER BY version_num DESC LIMIT 1"))
                current_version = result.fetchone()
                if current_version:
                    logger.info(f"✅ Current migration: {current_version[0]}")
                else:
                    logger.info("⚠️  No migrations applied yet")
            except Exception as e:
                logger.info(f"⚠️  Alembic version table: {str(e)}")
                
        return True
        
    except Exception as e:
        logger.info(f"❌ Database connection failed: {str(e)}")
        return False
    
    logger.info("")

def check_alembic_status():
    """Check Alembic migration status"""
    logger.info("📊 ALEMBIC MIGRATION STATUS")
    logger.info("=" * 50)
    
    try:
        from alembic.config import Config
        from alembic import command
        from alembic.script import ScriptDirectory
        
        # Create Alembic config
        alembic_cfg = Config("alembic.ini")
        script_dir = ScriptDirectory.from_config(alembic_cfg)
        
        # Get current revision
        try:
            current_rev = script_dir.get_current_head()
            logger.info(f"✅ Latest revision available: {current_rev}")
        except Exception as e:
            logger.info(f"⚠️  Could not get current head: {str(e)}")
        
        # List recent revisions
        revisions = list(script_dir.walk_revisions())[:5]
        logger.info(f"📋 Recent revisions ({len(revisions)} shown):")
        for rev in revisions:
            logger.info(f"   - {rev.revision}: {rev.doc}")
            
    except Exception as e:
        logger.info(f"❌ Alembic check failed: {str(e)}")
    
    logger.info("")

def check_dependencies():
    """Check Python dependencies"""
    logger.info("📦 DEPENDENCIES CHECK")
    logger.info("=" * 50)
    
    try:
        import fastapi
        import sqlalchemy
        import alembic
        import pydantic
        import uvicorn
        
        versions = {
            'fastapi': fastapi.__version__,
            'sqlalchemy': sqlalchemy.__version__,
            'alembic': alembic.__version__,
            'pydantic': pydantic.__version__,
            'uvicorn': uvicorn.__version__,
        }
        
        for pkg, version in versions.items():
            logger.info(f"✅ {pkg}: {version}")
            
    except ImportError as e:
        logger.info(f"❌ Import error: {str(e)}")
    
    logger.info("")

def check_port_configuration():
    """Check port configuration"""
    logger.info("🌐 PORT CONFIGURATION")
    logger.info("=" * 50)
    
    port = os.environ.get('PORT', '8080')
    logger.info(f"🔌 Application port: {port}")
    
    # Check if port is valid
    try:
        port_int = int(port)
        if 1 <= port_int <= 65535:
            logger.info(f"✅ Port {port_int} is valid")
        else:
            logger.info(f"❌ Port {port_int} is out of valid range")
    except ValueError:
        logger.info(f"❌ Port '{port}' is not a valid number")
    
    logger.info("")

def main():
    """Run all deployment checks"""
    logger.info("🚀 ASTROBSM DEPLOYMENT STATUS CHECK")
    logger.info("=" * 60)
    logger.info(f"⏰ Timestamp: {datetime.now().isoformat()}")
    logger.info(f"🐍 Python version: {sys.version}")
    logger.info(f"📁 Working directory: {os.getcwd()}")
    logger.info("")
    
    # Run all checks
    check_environment_variables()
    check_dependencies()
    check_static_files()
    check_port_configuration()
    check_database_connection()
    check_alembic_status()
    
    logger.info("🏁 DEPLOYMENT STATUS CHECK COMPLETE")
    logger.info("=" * 60)

if __name__ == "__main__":
    main()
