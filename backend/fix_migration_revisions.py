#!/usr/bin/env python3
"""
Fix migration revision IDs that are too long for the alembic_version table
"""
import os
import hashlib
import re

def generate_short_revision_id(original_id):
    """Generate a short 12-character revision ID from the original"""
    # Create a hash of the original ID and take first 12 characters
    hash_obj = hashlib.md5(original_id.encode())
    return hash_obj.hexdigest()[:12]

def fix_migration_files():
    """Fix migration files with long revision IDs"""
    versions_dir = "alembic/versions"
    
    if not os.path.exists(versions_dir):
        print(f"❌ Directory {versions_dir} not found")
        return False
    
    # Map of old revision ID to new revision ID
    revision_map = {}
    
    # Files that need fixing
    problematic_files = [
        "add_attendance_table.py",
        "add_device_fault_report_table.py", 
        "add_staff_appraisal_table.py",
        "add_logo_pdf_url_to_invoices.py",
        "add_product_status_column_20250608.py"
    ]
    
    print("🔧 Fixing migration revision IDs...")
    
    for filename in problematic_files:
        filepath = os.path.join(versions_dir, filename)
        if not os.path.exists(filepath):
            print(f"ℹ️  File {filename} not found, skipping...")
            continue
            
        print(f"📝 Processing {filename}...")
        
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Extract current revision ID
        revision_match = re.search(r"revision = ['\"]([^'\"]+)['\"]", content)
        if not revision_match:
            print(f"⚠️  Could not find revision ID in {filename}")
            continue
            
        old_revision = revision_match.group(1)
        
        # Only fix if the revision ID is longer than 32 characters
        if len(old_revision) <= 32:
            print(f"✅ {filename} revision ID is already short enough: {old_revision}")
            continue
            
        new_revision = generate_short_revision_id(old_revision)
        revision_map[old_revision] = new_revision
        
        print(f"   Old: {old_revision} ({len(old_revision)} chars)")
        print(f"   New: {new_revision} ({len(new_revision)} chars)")
        
        # Replace the revision ID
        content = re.sub(
            r"revision = ['\"]" + re.escape(old_revision) + r"['\"]",
            f"revision = '{new_revision}'",
            content
        )
        
        # Write the file back
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✅ Updated {filename}")
    
    # Now update down_revision references in other files
    print("\n🔗 Updating down_revision references...")
    
    for filename in os.listdir(versions_dir):
        if not filename.endswith('.py') or filename.startswith('__'):
            continue
            
        filepath = os.path.join(versions_dir, filename)
        
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        updated = False
        for old_rev, new_rev in revision_map.items():
            if f"down_revision = '{old_rev}'" in content:
                content = content.replace(f"down_revision = '{old_rev}'", f"down_revision = '{new_rev}'")
                updated = True
                print(f"   Updated down_revision in {filename}: {old_rev} -> {new_rev}")
        
        if updated:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
    
    print(f"\n✅ Fixed {len(revision_map)} migration files")
    return True

if __name__ == "__main__":
    success = fix_migration_files()
    if success:
        print("✅ Migration revision ID fix completed successfully")
    else:
        print("❌ Failed to fix migration revision IDs")
