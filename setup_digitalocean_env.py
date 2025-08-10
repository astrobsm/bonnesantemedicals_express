#!/usr/bin/env python3
"""
Generate secure credentials for DigitalOcean App Platform deployment.
This script provides instructions for setting up your database connection.
"""

import secrets
import string

def generate_secret_key(length=64):
    """Generate a secure secret key for JWT tokens."""
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
    return ''.join(secrets.choice(alphabet) for _ in range(length))

def main():
    print("🔐 AstroBSM DigitalOcean Environment Variables Setup")
    print("=" * 60)
    print()
    
    # Generate a new secure secret key
    secret_key = generate_secret_key()
    
    print("📋 Step 1: Your DigitalOcean Database Details")
    print("   You provided these connection details:")
    print("   • Host: your-database-host.digitalocean.com")
    print("   • Port: 25060")
    print("   • Username: your-db-username")
    print("   • Database: your-database-name")
    print("   • SSL: Required")
    print()
    
    print("📋 Step 2: Construct Your DATABASE_URL")
    print("   Format: postgresql://username:password@host:port/database?sslmode=require")
    print("   Using your credentials:")
    print("   postgresql://blakvelvet-db:YOUR_PASSWORD@app-9a7fd23c-9da8-4ace-96ef-8001f6da8ed3-do-user-23752526-0.e.db.ondigitalocean.com:25060/blakvelvet-db?sslmode=require")
    print("   (Replace YOUR_PASSWORD with your actual password)")
    print()
    
    print("📋 Step 3: Add to DigitalOcean App Platform")
    print("   Go to: App Settings > App-Level Environment Variables")
    print()
    
    print("🗃️  DATABASE_URL:")
    print("   Use the connection string from Step 2 above")
    print()
    
    print("🔑 SECRET_KEY:")
    print(f"   {secret_key}")
    print()
    
    print("📝 Additional environment variables (already set in app.yaml):")
    print("   ENVIRONMENT: production")
    print("   DEBUG: false")
    print()
    
    print("⚠️  SECURITY INSTRUCTIONS:")
    print("   1. Mark both DATABASE_URL and SECRET_KEY as 'Encrypted' in DigitalOcean")
    print("   2. Never commit actual passwords or secret keys to version control")
    print("   3. Use the 'Bulk Editor' in DigitalOcean for easier setup")
    print()
    
    print("🚀 Deployment Steps:")
    print("   1. Add the environment variables to DigitalOcean")
    print("   2. Ensure your database allows connections from App Platform")
    print("   3. Deploy your application")
    print("   4. Monitor logs for successful migration")
    print("   5. Test at: https://astrobsm-console-app-tcjnf.ondigitalocean.app")

if __name__ == "__main__":
    main()
