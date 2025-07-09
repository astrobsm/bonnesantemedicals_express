#!/usr/bin/env python3
"""
Simple startup test to verify the app can initialize without database
"""
import os
import sys

# Add the app directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

def test_app_imports():
    """Test if the app can be imported"""
    try:
        from app.main import app
        print("✅ App imported successfully")
        return True
    except Exception as e:
        print(f"❌ App import failed: {e}")
        return False

def test_basic_config():
    """Test basic configuration"""
    try:
        from app.core.config import settings
        print(f"✅ Configuration loaded - Environment: {settings.ENVIRONMENT}")
        return True
    except Exception as e:
        print(f"❌ Configuration failed: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Testing basic app startup...")
    
    tests = [
        test_app_imports,
        test_basic_config
    ]
    
    all_passed = True
    for test in tests:
        if not test():
            all_passed = False
    
    if all_passed:
        print("🎉 Basic startup tests passed!")
        sys.exit(0)
    else:
        print("❌ Some tests failed")
        sys.exit(1)
