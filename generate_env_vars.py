#!/usr/bin/env python3
"""
Generate secure credentials for DigitalOcean App Platform deployment.
Run this script to get the environment variables needed for your app.
"""

import secrets
import string

def generate_secret_key(length=64):
    """Generate a secure secret key for JWT tokens."""
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
    return ''.join(secrets.choice(alphabet) for _ in range(length))

def main():
    print("🔐 AstroBSM DigitalOcean Setup Guide")
    print("=" * 60)
    print()
    
    print("📋 Step 1: Create a DigitalOcean Managed Database")
    print("   1. Go to DigitalOcean Dashboard > Databases")
    print("   2. Click 'Create Database Cluster'")
    print("   3. Choose PostgreSQL (version 14 or 15)")
    print("   4. Select the same region as your app (Frankfurt)")
    print("   5. Choose your preferred size:")
    print("      • Basic ($15/month) - 1 vCPU, 1GB RAM, 10GB storage")
    print("      • Professional ($60/month) - 1 vCPU, 2GB RAM, 25GB storage")
    print("   6. Name it: astrobsm-database")
    print("   7. Wait for provisioning (5-10 minutes)")
    print("   8. After creation, go to 'Overview' tab")
    print("   9. Copy the connection string from 'Connection Details'")
    print()
    
    # Generate a new secure secret key
    secret_key = generate_secret_key()
    
    print("📋 Step 2: Get Your Database Connection String")
    print("   Your DATABASE_URL will look like this:")
    print("   postgresql://doadmin:YOUR_PASSWORD@astrobsm-database-do-user-123456-0.b.db.ondigitalocean.com:25060/defaultdb?sslmode=require")
    print()
    
    print("📋 Step 3: Add Environment Variables to Your App")
    print("   Go to: DigitalOcean App Platform > astrobsm-console-app > Settings > App-Level Environment Variables")
    print()
    
    print("🗃️  DATABASE_URL:")
    print("   Paste your DigitalOcean database connection string here")
    print()
    
    print("🔑 SECRET_KEY:")
    print(f"   {secret_key}")
    print()
    
    print("📝 Additional environment variables (already set in app.yaml):")
    print("   ENVIRONMENT: production")
    print("   DEBUG: false")
    print()
    
    print("⚠️  IMPORTANT SECURITY NOTES:")
    print("   • Mark both DATABASE_URL and SECRET_KEY as 'Encrypted' in DigitalOcean")
    print("   • Keep these values secure and never commit them to version control")
    print("   • The SECRET_KEY is used for JWT token signing - keep it private")
    print("   • DigitalOcean Managed Database automatically handles backups and security")
    print()
    
    print("🎯 Step 4: Configure Your Database Access")
    print("   1. In your DigitalOcean Database dashboard:")
    print("   2. Go to 'Settings' tab")
    print("   3. Under 'Trusted Sources', add your App Platform")
    print("   4. Click 'Add trusted source' > 'App Platform'")
    print("   5. Select your astrobsm-console-app")
    print()
    
    print("🚀 Step 5: Deploy Your Application")
    print("   1. Save the environment variables in DigitalOcean")
    print("   2. Trigger a new deployment (automatic after saving env vars)")
    print("   3. Monitor deployment logs for successful migration")
    print("   4. Test your app at: https://astrobsm-console-app-tcjnf.ondigitalocean.app")
    print()
    
    print("✅ Benefits of DigitalOcean Managed Database:")
    print("   • Automatic backups and point-in-time recovery")
    print("   • High availability and automatic failover")
    print("   • Built-in monitoring and alerting")
    print("   • Automatic security updates")
    print("   • SSL encryption by default")
    print("   • Same data center as your app (low latency)")

if __name__ == "__main__":
    main()
