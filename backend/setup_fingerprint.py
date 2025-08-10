"""
Setup script for DigitalPersona Fingerprint Integration
Run this script to set up the fingerprint attendance system.
"""

import os
import sys
import subprocess
import shutil
import winreg
import ctypes
from pathlib import Path

def is_admin():
    """Check if running as administrator."""
    try:
        return ctypes.windll.shell32.IsUserAnAdmin()
    except:
        return False

def run_as_admin():
    """Re-run the script as administrator."""
    if is_admin():
        return True
    else:
        print("This script requires administrator privileges.")
        print("Please run as administrator or the script will restart with elevated privileges.")
        
        # Re-run as admin
        ctypes.windll.shell32.ShellExecuteW(
            None, "runas", sys.executable, " ".join(sys.argv), None, 1)
        return False

def check_digitalpersona_sdk():
    """Check if DigitalPersona SDK is installed."""
    sdk_paths = [
        r"C:\Program Files\DigitalPersona\U.are.U SDK",
        r"C:\Program Files (x86)\DigitalPersona\U.are.U SDK",
        r"C:\Users\USER\Documents\Wound Care Business\BRANDING FILE\u are u"
    ]
    
    for path in sdk_paths:
        if os.path.exists(path):
            print(f"✓ DigitalPersona SDK found at: {path}")
            return True
    
    print("⚠ DigitalPersona SDK not found in standard locations.")
    print("Please ensure the U.are.U SDK is installed.")
    return False

def install_python_dependencies():
    """Install required Python packages."""
    print("Installing Python dependencies...")
    
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "pywin32"])
        subprocess.check_call([sys.executable, "-m", "pip", "install", "asyncpg"])
        print("✓ Python dependencies installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"✗ Failed to install dependencies: {e}")
        return False

def setup_database_migration():
    """Run database migration for fingerprint tables."""
    print("Setting up database migration...")
    
    try:
        # Check if migration file exists
        migration_file = Path("alembic/versions/add_fingerprint_integration.py")
        if migration_file.exists():
            print("✓ Migration file found")
            
            # Note: In production, you would run the migration here
            # For now, we'll just inform the user
            print("📝 To apply the migration, run:")
            print("   cd backend")
            print("   python -m alembic upgrade head")
            
            return True
        else:
            print("✗ Migration file not found")
            return False
            
    except Exception as e:
        print(f"✗ Migration setup error: {e}")
        return False

def install_windows_service():
    """Install the fingerprint service as a Windows service."""
    print("Installing Windows service...")
    
    try:
        service_script = Path("fingerprint_service.py")
        if not service_script.exists():
            print("✗ Service script not found")
            return False
        
        # Install the service
        cmd = [sys.executable, "fingerprint_service.py", "install"]
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✓ Windows service installed successfully")
            
            # Start the service
            start_cmd = [sys.executable, "fingerprint_service.py", "start"]
            start_result = subprocess.run(start_cmd, capture_output=True, text=True)
            
            if start_result.returncode == 0:
                print("✓ Service started successfully")
                return True
            else:
                print(f"⚠ Service installed but failed to start: {start_result.stderr}")
                return True
        else:
            print(f"✗ Failed to install service: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"✗ Service installation error: {e}")
        return False

def setup_firewall_rules():
    """Add firewall rules for the fingerprint service."""
    print("Setting up firewall rules...")
    
    try:
        # Add inbound rule for port 8001
        cmd = [
            "netsh", "advfirewall", "firewall", "add", "rule",
            "name=AstroBSM Fingerprint Service",
            "dir=in", "action=allow", "protocol=TCP", "localport=8001"
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✓ Firewall rule added successfully")
            return True
        else:
            print(f"⚠ Firewall rule setup failed: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"✗ Firewall setup error: {e}")
        return False

def create_desktop_shortcut():
    """Create a desktop shortcut for the fingerprint attendance interface."""
    print("Creating desktop shortcut...")
    
    try:
        desktop = Path.home() / "Desktop"
        shortcut_path = desktop / "AstroBSM Fingerprint Attendance.url"
        
        # Create URL shortcut to the fingerprint interface
        shortcut_content = """[InternetShortcut]
URL=http://localhost:3000/fingerprint-attendance
IconFile=shell32.dll
IconIndex=13
"""
        
        with open(shortcut_path, 'w') as f:
            f.write(shortcut_content)
        
        print("✓ Desktop shortcut created")
        return True
        
    except Exception as e:
        print(f"✗ Shortcut creation error: {e}")
        return False

def main():
    """Main setup function."""
    print("=" * 60)
    print("AstroBSM Fingerprint Integration Setup")
    print("=" * 60)
    
    # Check admin privileges
    if not run_as_admin():
        return
    
    success_count = 0
    total_steps = 6
    
    # Step 1: Check DigitalPersona SDK
    if check_digitalpersona_sdk():
        success_count += 1
    
    # Step 2: Install Python dependencies
    if install_python_dependencies():
        success_count += 1
    
    # Step 3: Setup database migration
    if setup_database_migration():
        success_count += 1
    
    # Step 4: Install Windows service
    if install_windows_service():
        success_count += 1
    
    # Step 5: Setup firewall rules
    if setup_firewall_rules():
        success_count += 1
    
    # Step 6: Create desktop shortcut
    if create_desktop_shortcut():
        success_count += 1
    
    print("\n" + "=" * 60)
    print(f"Setup completed: {success_count}/{total_steps} steps successful")
    print("=" * 60)
    
    if success_count == total_steps:
        print("🎉 Fingerprint integration setup completed successfully!")
        print("\nNext steps:")
        print("1. Run the database migration: 'python -m alembic upgrade head'")
        print("2. Start your main application")
        print("3. Navigate to the fingerprint attendance page")
        print("4. Enroll staff fingerprints")
    else:
        print("⚠ Setup completed with some issues. Please review the output above.")
    
    print("\nService Management Commands:")
    print("- Start service: python fingerprint_service.py start")
    print("- Stop service: python fingerprint_service.py stop")
    print("- Remove service: python fingerprint_service.py remove")
    
    input("\nPress Enter to exit...")

if __name__ == "__main__":
    main()
