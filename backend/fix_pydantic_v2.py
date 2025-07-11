#!/usr/bin/env python3
"""
Fix all orm_mode instances to from_attributes for Pydantic V2 compatibility
"""
import os
import re

def fix_orm_mode_in_file(filepath):
    """Replace orm_mode = True with from_attributes = True in a file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Replace orm_mode = True with from_attributes = True
        updated_content = re.sub(r'orm_mode\s*=\s*True', 'from_attributes = True', content)
        
        if content != updated_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(updated_content)
            print(f"✅ Fixed: {filepath}")
            return True
        else:
            print(f"ℹ️  No changes needed: {filepath}")
            return False
    except Exception as e:
        print(f"❌ Error processing {filepath}: {e}")
        return False

def main():
    """Fix all Python files with orm_mode"""
    files_to_fix = [
        "app/api/v1/endpoints/production_requirements.py",
        "app/schemas/returned_product.py", 
        "app/schemas/device_fault_report.py",
        "app/schemas/attendance.py",
        "app/schemas/appraisal.py",
        "app/api/v1/endpoints/production_output.py"
    ]
    
    print("🔧 Fixing Pydantic V2 compatibility issues...")
    print("Replacing orm_mode = True with from_attributes = True")
    print("-" * 60)
    
    fixed_count = 0
    for filepath in files_to_fix:
        if os.path.exists(filepath):
            if fix_orm_mode_in_file(filepath):
                fixed_count += 1
        else:
            print(f"⚠️  File not found: {filepath}")
    
    print("-" * 60)
    print(f"🎯 Fixed {fixed_count} files")
    print("✅ Pydantic V2 compatibility updates complete!")

if __name__ == "__main__":
    main()
