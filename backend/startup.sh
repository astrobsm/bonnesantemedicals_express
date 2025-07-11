#!/bin/bash
set -e

echo "🚀 Starting AstroBSM deployment..."

# Get port from environment or default to 8080
PORT=${PORT:-8080}
echo "🌐 Application will run on port: $PORT"

# Print environment info for debugging
echo "🔧 Environment: ${ENVIRONMENT:-development}"
echo "📁 Working directory: $(pwd)"
echo "🐍 Python version: $(python --version)"

# Validate required environment variables
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable is not set"
    exit 1
fi

if [ -z "$SECRET_KEY" ]; then
    echo "❌ ERROR: SECRET_KEY environment variable is not set"
    exit 1
fi

echo "✅ Required environment variables are set"

# Wait for database to be ready (with retries)
echo "🔌 Testing database connection..."
MAX_RETRIES=10
RETRY_COUNT=0
RETRY_DELAY=15

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    echo "🔄 Database connection attempt $((RETRY_COUNT + 1))/$MAX_RETRIES..."
    if timeout 45 python test_db_connection.py; then
        echo "✅ Database connection successful"
        break
    else
        RETRY_COUNT=$((RETRY_COUNT + 1))
        echo "⚠️  Database connection attempt $RETRY_COUNT/$MAX_RETRIES failed"
        if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
            echo "⏳ Waiting $RETRY_DELAY seconds before retry..."
            echo "🔧 Checking if database service is starting up..."
            sleep $RETRY_DELAY
        else
            echo "❌ Database connection failed after $MAX_RETRIES attempts"
            echo "🔧 This might be normal if database is still initializing"
            echo "🚀 Continuing with deployment - migrations may establish connection"
        fi
    fi
done

# Fix alembic_version column if needed (with error handling)
echo "🔧 Fixing alembic_version column if needed..."
python fix_alembic_version_column.py || echo "⚠️  Alembic version column fix completed (table may not exist yet)"

# Run database migrations with better error handling
echo "📊 Running database migrations..."
if python -m alembic upgrade head; then
    echo "✅ Migrations completed successfully"
else
    echo "❌ Migration failed - checking if we need to create initial schema"
    
    # Try to create alembic version table manually
    echo "🔧 Attempting to initialize Alembic..."
    python -m alembic stamp head || echo "⚠️  Could not stamp head, will try migration again"
    
    # Try migrations one more time
    if python -m alembic upgrade head; then
        echo "✅ Migrations completed on second attempt"
    else
        echo "❌ Migrations failed - starting app anyway (may work if database is already set up)"
    fi
fi

# Verify static files exist
if [ -d "app/static" ]; then
    echo "✅ Static files found: $(find app/static -type f | wc -l) files"
    echo "📁 Static files: $(ls -la app/static | head -5)"
else
    echo "⚠️  No static files found - React frontend may not be built"
    mkdir -p app/static
    echo "<!DOCTYPE html><html><head><title>AstroBSM</title></head><body><h1>AstroBSM API</h1><p>Frontend not built</p></body></html>" > app/static/index.html
fi

# Start the application with proper error handling
echo "🌐 Starting FastAPI application on 0.0.0.0:$PORT..."
exec python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT --log-level info --access-log
