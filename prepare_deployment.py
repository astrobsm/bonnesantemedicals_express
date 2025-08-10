#!/usr/bin/env python3
"""
Deployment Preparation Script for AstroBSM Oracle IVANSTAMAS
Prepares the application for Digital Ocean deployment
"""
import subprocess
import sys
import os
from pathlib import Path

def run_command(command, description):
    """Run a command and return success status"""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ {description} completed successfully")
            return True
        else:
            print(f"❌ {description} failed: {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ {description} failed: {e}")
        return False

def check_git_status():
    """Check Git repository status"""
    print("\n📊 Git Repository Status")
    print("=" * 50)
    
    # Check if we're in a git repository
    if not run_command("git status", "Checking Git status"):
        print("⚠️  Not in a Git repository. Initializing...")
        run_command("git init", "Initializing Git repository")
    
    # Show current status
    result = subprocess.run("git status --porcelain", shell=True, capture_output=True, text=True)
    
    if result.stdout.strip():
        print("📝 Changed files:")
        for line in result.stdout.strip().split('\n'):
            print(f"  {line}")
    else:
        print("✅ No pending changes")

def prepare_for_deployment():
    """Prepare application for deployment"""
    print("🚀 Preparing for Digital Ocean Deployment")
    print("=" * 50)
    
    # Create .gitignore if it doesn't exist
    gitignore_content = """
# Environment variables
.env
*.env

# Python
__pycache__/
*.pyc
*.pyo
*.pyd
.Python
*.so
.pytest_cache/
*.coverage

# Node.js
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
logs/

# Database
*.db
*.sqlite

# Build
build/
dist/
*.egg-info/

# React
/build
/public/hot
/public/storage
/storage/*.key
"""
    
    gitignore_path = Path(".gitignore")
    if not gitignore_path.exists():
        with open(gitignore_path, 'w') as f:
            f.write(gitignore_content.strip())
        print("✅ Created .gitignore file")
    
    # Create deployment README
    deployment_readme = """# AstroBSM Oracle IVANSTAMAS - Deployment Guide

## 🚀 Digital Ocean Deployment

### Prerequisites
- Digital Ocean Account
- Docker installed locally
- Git repository access

### Quick Deploy
1. Push code to repository
2. Create Digital Ocean App
3. Connect to GitHub repository
4. Configure environment variables
5. Deploy!

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string
- `SECRET_KEY`: JWT secret key
- `DEBUG`: Set to "false" for production

### Features Included
- ✅ FastAPI Backend with fingerprint integration
- ✅ React Frontend 
- ✅ PostgreSQL Database support
- ✅ DigitalPersona SDK integration
- ✅ Authentication system
- ✅ Comprehensive API documentation

### Admin Credentials
- Username: blakvelvet
- Password: chibuike_douglas
- Role: Admin

### API Endpoints
- Authentication: `/api/v1/auth/`
- Fingerprint: `/api/v1/fingerprint/`
- Documentation: `/docs`

### Support
For deployment issues, check the logs in Digital Ocean dashboard.
"""
    
    readme_path = Path("DEPLOYMENT.md")
    with open(readme_path, 'w') as f:
        f.write(deployment_readme.strip())
    print("✅ Created DEPLOYMENT.md")

def commit_and_push():
    """Commit changes and push to repository"""
    print("\n📤 Git Operations")
    print("=" * 50)
    
    # Add all files
    if not run_command("git add .", "Adding all files"):
        return False
    
    # Commit changes
    commit_message = "feat: Complete fingerprint attendance integration with DigitalPersona SDK\n\n- Added fingerprint registration and verification endpoints\n- Integrated DigitalPersona U.are.U SDK for Windows\n- Created React components for fingerprint attendance\n- Added comprehensive test suite\n- Prepared for Digital Ocean deployment\n- Updated documentation and setup scripts"
    
    if not run_command(f'git commit -m "{commit_message}"', "Committing changes"):
        print("ℹ️  No changes to commit or commit failed")
    
    # Set remote origin if not set
    remote_url = "https://github.com/astrobsm/bonnesantemedicals_express.git"
    run_command(f"git remote add origin {remote_url}", "Adding remote origin")
    
    # Push to repository
    if run_command("git push -u origin master", "Pushing to GitHub"):
        print("🎉 Successfully pushed to GitHub!")
        return True
    else:
        # Try pushing to main branch if master fails
        if run_command("git push -u origin main", "Pushing to GitHub (main branch)"):
            print("🎉 Successfully pushed to GitHub!")
            return True
        else:
            print("❌ Failed to push to GitHub")
            return False

def main():
    """Main deployment preparation function"""
    print("🌟 AstroBSM Oracle IVANSTAMAS - Deployment Preparation")
    print("=" * 60)
    
    # Change to project directory
    project_root = Path(__file__).parent
    os.chdir(project_root)
    
    # Run preparation steps
    check_git_status()
    prepare_for_deployment()
    
    # Commit and push
    success = commit_and_push()
    
    if success:
        print("\n🎉 Deployment Preparation Complete!")
        print("=" * 50)
        print("✅ Code committed and pushed to GitHub")
        print("✅ Ready for Digital Ocean deployment")
        print("🔗 Repository: https://github.com/astrobsm/bonnesantemedicals_express.git")
        print("\nNext steps:")
        print("1. Go to Digital Ocean Apps")
        print("2. Create new app from GitHub repository") 
        print("3. Configure environment variables")
        print("4. Deploy!")
    else:
        print("\n⚠️  Deployment preparation completed with issues")
        print("Please check the errors above and try again.")

if __name__ == "__main__":
    main()
