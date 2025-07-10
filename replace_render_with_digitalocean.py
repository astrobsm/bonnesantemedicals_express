#!/usr/bin/env python3
"""
Replace all Render PostgreSQL references with DigitalOcean Managed Database.
This script will update all configuration files to use environment variables instead of hardcoded Render URLs.
"""

import os
import re
import glob

def find_and_replace_in_file(file_path, old_pattern, new_content):
    """Replace content in a file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()
        
        if old_pattern in content:
            updated_content = content.replace(old_pattern, new_content)
            with open(file_path, 'w', encoding='utf-8') as file:
                file.write(updated_content)
            print(f"✅ Updated: {file_path}")
            return True
        return False
    except Exception as e:
        print(f"❌ Error updating {file_path}: {e}")
        return False

def replace_render_database_urls():
    """Replace all Render database URLs with environment variable usage."""
    
    # Render database URL to replace
    old_db_url = "postgresql://astrobsm:WttcHRFGuDdzcwFn5YtdcNodlshXJ3sT@dpg-d10a2i8gjchc73agp9a0-a.oregon-postgres.render.com/bonnesantemedical_db"
    old_host = "dpg-d10a2i8gjchc73agp9a0-a.oregon-postgres.render.com"
    
    # New environment variable usage
    new_db_url = "os.environ.get('DATABASE_URL', 'postgresql://user:password@localhost/astrobsm_db')"
    new_host = "os.environ.get('PGHOST', 'localhost')"
    
    print("🔄 Replacing Render PostgreSQL references with DigitalOcean-compatible environment variables...")
    print("=" * 80)
    
    # Files to update
    files_to_update = [
        'backend/.env',
        'backend/.env.production',
        'backend/app/core/config.py',
        'backend/drop_all_tables.py',
        'backend/print_metadata_tables.py',
        'backend/seed_user_activity.py',
        'backend/update_user_password.py',
        'backend/update_user_status.py',
        'backend/set_alembic_version.py',
        'backend/reset_admin_password_and_status.py',
        'backend/list_and_drop_device_fault_reports.py',
        'backend/drop_device_fault_reports_table.py',
        'backend/create_alembic_version_table.py',
        'backend/create_admin_user.py',
        'backend/alter_alembic_version_column.py',
        'generate_env_vars.py'
    ]
    
    updated_files = []
    
    for file_path in files_to_update:
        if os.path.exists(file_path):
            # Replace full database URLs
            if find_and_replace_in_file(file_path, old_db_url, new_db_url):
                updated_files.append(file_path)
            
            # Replace host references
            find_and_replace_in_file(file_path, old_host, new_host)
    
    # Also check for any Render backend URL references
    render_backend_url = "https://astrobsm-oracle-backend.onrender.com"
    new_backend_url = "https://astrobsm-console-app-tcjnf.ondigitalocean.app"
    
    find_and_replace_in_file('reset_admin_remote.py', render_backend_url, new_backend_url)
    
    print(f"\n✅ Updated {len(updated_files)} files")
    print("\n🎯 Next steps:")
    print("1. Create a DigitalOcean Managed Database (PostgreSQL)")
    print("2. Get the connection string from DigitalOcean")
    print("3. Set DATABASE_URL in DigitalOcean App Platform environment variables")
    print("4. Deploy your application")

if __name__ == "__main__":
    replace_render_database_urls()
