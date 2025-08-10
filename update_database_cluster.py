#!/usr/bin/env python3
"""
Update AstroBSM application to use new DigitalOcean database cluster
New cluster credentials:
- username: doadmin
- password: AVNS_IwToJq7-PA6XNU_1ZTv
- host: your-database-host.digitalocean.com
- port: 25060
- database: defaultdb
- sslmode: require
"""

import os
import secrets
import string
from urllib.parse import quote

def generate_secret_key(length=64):
    """Generate a secure random secret key"""
    alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
    return ''.join(secrets.choice(alphabet) for _ in range(length))

def main():
    print("🔧 AstroBSM Database Cluster Update")
    print("=" * 60)
    print()
    
    # New database credentials
    db_username = "doadmin"
    db_password = "AVNS_IwToJq7-PA6XNU_1ZTv"
    db_host = "your-database-host.digitalocean.com"
    db_port = "25060"
    db_name = "defaultdb"
    ssl_mode = "require"
    
    # URL encode the password to handle special characters
    encoded_password = quote(db_password, safe='')
    
    # Construct the new DATABASE_URL
    new_database_url = f"postgresql://{db_username}:{encoded_password}@{db_host}:{db_port}/{db_name}?sslmode={ssl_mode}"
    
    print("📋 NEW DATABASE CONFIGURATION")
    print("-" * 50)
    print(f"Host: {db_host}")
    print(f"Port: {db_port}")
    print(f"Database: {db_name}")
    print(f"Username: {db_username}")
    print(f"SSL Mode: {ssl_mode}")
    print()
    
    print("🔗 NEW DATABASE_URL")
    print("-" * 50)
    print(f"DATABASE_URL={new_database_url}")
    print()
    
    # Generate a new secret key
    new_secret_key = generate_secret_key()
    print("🔑 NEW SECRET_KEY")
    print("-" * 50)
    print(f"SECRET_KEY={new_secret_key}")
    print()
    
    print("📝 DIGITALOCEAN APP PLATFORM SETUP")
    print("-" * 50)
    print("1. Go to your DigitalOcean App Platform dashboard")
    print("2. Navigate to your app > Settings > App-Level Environment Variables")
    print("3. Update/Add these environment variables:")
    print()
    print("   Variable: DATABASE_URL")
    print(f"   Value: {new_database_url}")
    print("   Type: Secret (encrypted)")
    print()
    print("   Variable: SECRET_KEY")
    print(f"   Value: {new_secret_key}")
    print("   Type: Secret (encrypted)")
    print()
    
    print("🔧 LOCAL DEVELOPMENT SETUP")
    print("-" * 50)
    print("For local development, update your backend/.env file:")
    print(f"DATABASE_URL={new_database_url}")
    print(f"SECRET_KEY={new_secret_key}")
    print()
    
    print("✅ VERIFICATION STEPS")
    print("-" * 50)
    print("After updating environment variables:")
    print("1. Deploy/redeploy your app in DigitalOcean")
    print("2. Check deployment logs for 'Database connection successful'")
    print("3. Verify migrations run without errors")
    print("4. Test the health endpoint: https://your-app.ondigitalocean.app/health")
    print("5. Test the API documentation: https://your-app.ondigitalocean.app/docs")
    print()
    
    print("🔒 SECURITY NOTES")
    print("-" * 50)
    print("• Both DATABASE_URL and SECRET_KEY contain sensitive information")
    print("• Mark both as 'Secret' (encrypted) in DigitalOcean App Platform")
    print("• Never commit these values to version control")
    print("• The new database cluster has SSL enabled by default")
    print()
    
    print("🚀 DEPLOYMENT ADVANTAGES")
    print("-" * 50)
    print("• New database cluster should have better performance")
    print("• SSL is properly configured")
    print("• Connection should be more stable")
    print("• Dedicated database resources")
    print()
    
    # Save configuration to files for reference
    env_content = f"""# Updated Environment Variables for New Database Cluster
# DO NOT commit this file with real values!

DATABASE_URL={new_database_url}
SECRET_KEY={new_secret_key}
ENVIRONMENT=production
DEBUG=false
PORT=8080

# Database Connection Details (for reference)
DB_HOST={db_host}
DB_PORT={db_port}
DB_NAME={db_name}
DB_USERNAME={db_username}
DB_SSL_MODE={ssl_mode}
"""
    
    with open('backend/.env.new-cluster', 'w') as f:
        f.write(env_content)
    
    print(f"💾 Configuration saved to: backend/.env.new-cluster")
    print("   (Reference file - do not commit to git!)")
    print()
    
    print("🎯 NEXT STEPS")
    print("-" * 50)
    print("1. Update environment variables in DigitalOcean App Platform")
    print("2. Redeploy your application")
    print("3. Monitor deployment logs")
    print("4. Test application functionality")
    print("5. Update local .env file for development")

if __name__ == "__main__":
    main()
