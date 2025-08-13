#!/usr/bin/env python3
"""
Verify that all tables were created successfully in the database.
"""
import os
from sqlalchemy import create_engine, inspect

# Use the provided credentials
DATABASE_URL = "postgresql://doadmin:AVNS_IwToJq7-PA6XNU_1ZTv@astrobsmvelvet-db-do-user-23752526-0.e.db.ondigitalocean.com:25060/defaultdb?sslmode=require"

def verify_tables():
    try:
        engine = create_engine(DATABASE_URL)
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        print(f"✅ Successfully connected to database!")
        print(f"📊 Found {len(tables)} tables:")
        
        for table in sorted(tables):
            print(f"  - {table}")
            
        # Check for key tables that should exist
        expected_tables = [
            'users', 'products', 'inventory', 'warehouses', 'suppliers', 
            'customers', 'staff', 'raw_materials', 'devices', 'fingerprint_templates'
        ]
        
        missing_tables = [table for table in expected_tables if table not in tables]
        
        if missing_tables:
            print(f"\n⚠️  Missing expected tables: {missing_tables}")
        else:
            print(f"\n✅ All expected core tables are present!")
            
        return len(tables) > 0
        
    except Exception as e:
        print(f"❌ Error connecting to database: {e}")
        return False

if __name__ == "__main__":
    verify_tables()
