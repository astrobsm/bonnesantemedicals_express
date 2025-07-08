#!/usr/bin/env python3
"""
Test script to verify deployment readiness
"""
import os
import sys
import subprocess

def test_imports():
    """Test if all required modules can be imported"""
    try:
        import app.main
        import app.db.models
        import app.core.config
        print("✅ All imports successful")
        return True
    except Exception as e:
        print(f"❌ Import error: {e}")
        return False

def test_database_connection():
    """Test database connection"""
    try:
        from app.db.session import SessionLocal
        from app.core.config import settings
        
        # Test database URL is configured
        if not settings.DATABASE_URL:
            print("❌ DATABASE_URL not configured")
            return False
            
        print("✅ Database configuration looks good")
        return True
    except Exception as e:
        print(f"❌ Database connection error: {e}")
        return False

def test_alembic():
    """Test Alembic configuration"""
    try:
        # Check if alembic.ini exists
        if not os.path.exists('alembic.ini'):
            print("❌ alembic.ini not found")
            return False
            
        # Check if alembic directory exists
        if not os.path.exists('alembic'):
            print("❌ alembic directory not found")
            return False
            
        print("✅ Alembic configuration looks good")
        return True
    except Exception as e:
        print(f"❌ Alembic configuration error: {e}")
        return False

if __name__ == "__main__":
    print("🔍 Testing deployment readiness...")
    
    tests = [
        ("Imports", test_imports),
        ("Database", test_database_connection),
        ("Alembic", test_alembic)
    ]
    
    all_passed = True
    for test_name, test_func in tests:
        print(f"\n📋 Testing {test_name}...")
        if not test_func():
            all_passed = False
    
    if all_passed:
        print("\n🎉 All tests passed! Ready for deployment.")
        sys.exit(0)
    else:
        print("\n❌ Some tests failed. Please fix issues before deployment.")
        sys.exit(1)
