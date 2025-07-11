# AstroBSM-Oracle-IVANSTAMAS Deployment Troubleshooting Guide

## Quick Status Check

Run this command to get a comprehensive status report:
```bash
python deployment_status.py
```

## Common Deployment Issues and Solutions

### 1. Environment Variable Issues

**Problem**: App fails to start with "DATABASE_URL not set" or "SECRET_KEY not set"

**Solution**: 
- In DigitalOcean App Platform dashboard, go to Settings > App-Level Environment Variables
- Add these variables (case-sensitive):
  - `DATABASE_URL`: Your PostgreSQL connection string from the database addon
  - `SECRET_KEY`: A strong random string (minimum 32 characters)

**Check**: Verify environment variables are spelled correctly (common typos: `SECRETE_KEY` instead of `SECRET_KEY`)

### 2. Database Connection Issues

**Problem**: "Database connection failed" or timeout errors

**Solutions**:
- Ensure the PostgreSQL database addon is properly attached to your app
- Verify DATABASE_URL format: `postgresql://user:password@host:port/database`
- Check if the database service is running in DigitalOcean
- Wait a few minutes after creating the database addon before deploying

**Debug**: Check deployment logs for specific database error messages

### 3. Alembic Migration Errors

**Problem**: Migration fails with revision ID errors or table conflicts

**Solutions**:
- The app includes automatic migration fixes in `startup.sh`
- If migrations fail, the app will still start (database might be manually set up)
- For persistent issues, manually run: `python fix_migration_revisions.py`

**Reset Option**: If needed, you can drop and recreate the database (data will be lost):
- In DigitalOcean, delete the database addon
- Create a new PostgreSQL database addon
- Redeploy the app

### 4. Frontend Build Issues

**Problem**: Frontend not loading, shows "React app not found"

**Solutions**:
- Check that build process completes successfully in deployment logs
- Verify React build files are copied to `backend/app/static/`
- Look for Node.js/npm errors in build logs

**Manual Fix**: If build fails, the app will create a fallback index.html

### 5. Port Configuration Issues

**Problem**: App starts but is not accessible

**Solutions**:
- DigitalOcean automatically sets PORT=8080
- The app is configured to use this port automatically
- Ensure your app.yaml has `http_port: 8080`

### 6. Dependency Compatibility Issues

**Problem**: Import errors or version conflicts

**Solutions**:
- Current requirements.txt has tested compatible versions
- If you see dependency errors, check deployment logs for specific conflicts
- The app uses: SQLAlchemy 2.0.25, Alembic 1.13.2, Pydantic 2.5.2

### 7. CORS Issues

**Problem**: Frontend can't connect to backend API

**Solutions**:
- The app allows all origins in production (`allow_origins=["*"]`)
- For development, it restricts to localhost:3000
- Check browser console for CORS error details

## Deployment Logs Locations

1. **Build Logs**: DigitalOcean Dashboard > App > Activity tab > Build details
2. **Runtime Logs**: DigitalOcean Dashboard > App > Runtime Logs tab
3. **Database Logs**: DigitalOcean Dashboard > Databases > Your DB > Logs

## Health Check Endpoints

After deployment, test these endpoints:

1. **API Status**: `https://your-app.ondigitalocean.app/`
2. **Health Check**: `https://your-app.ondigitalocean.app/health`
3. **API Documentation**: `https://your-app.ondigitalocean.app/docs`
4. **Frontend**: `https://your-app.ondigitalocean.app/app`

## Manual Debugging Steps

### 1. Test Database Connection
```bash
python test_db_connection.py
```

### 2. Check Migration Status
```bash
python -m alembic current
python -m alembic history
```

### 3. Run Migrations Manually
```bash
python -m alembic upgrade head
```

### 4. Check Static Files
```bash
ls -la app/static/
```

### 5. Test API Locally
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8080
```

## Emergency Recovery

If deployment is completely broken:

1. **Reset Database**: Delete and recreate the PostgreSQL addon
2. **Force Rebuild**: Make a small change (add a comment) and push to trigger rebuild
3. **Check Environment**: Verify all environment variables in DigitalOcean dashboard
4. **Review Logs**: Check build and runtime logs for specific error messages

## Getting Help

1. Run `python deployment_status.py` and share the output
2. Check DigitalOcean deployment logs and share relevant error messages
3. Verify environment variables are set correctly in the dashboard
4. Test individual components (database connection, static files, etc.)

## Successful Deployment Indicators

- ✅ Build completes without errors
- ✅ Environment variables are set correctly  
- ✅ Database connection succeeds
- ✅ Migrations complete successfully
- ✅ Static files are built and copied
- ✅ App starts on correct port (8080)
- ✅ Health check endpoint returns success
- ✅ Frontend loads correctly
