#!/usr/bin/env python3
"""
Test the fixed Pydantic configuration
"""

try:
    from app.core.config import settings
    print("✅ SUCCESS: Configuration loaded successfully")
    print(f"Environment: {settings.ENVIRONMENT}")
    print(f"Debug: {settings.DEBUG}")
    print(f"Database URL configured: {bool(settings.DATABASE_URL)}")
    print("✅ Pydantic configuration conflict resolved!")
except Exception as e:
    print(f"❌ ERROR: {e}")
    import traceback
    traceback.print_exc()
