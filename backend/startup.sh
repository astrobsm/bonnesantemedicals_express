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

# Test database connection first
echo "🔌 Testing database connection..."
if python test_db_connection.py; then
    echo "✅ Database connection successful"
else
    echo "❌ Database connection failed - continuing anyway (migrations will create tables)"
fi

# Fix alembic_version column if needed
echo "🔧 Fixing alembic_version column if needed..."
python fix_alembic_version_column.py || echo "⚠️  Alembic version column fix completed (expected if table doesn't exist yet)"

# Run database migrations
echo "📊 Running database migrations..."
python -m alembic upgrade head
echo "✅ Migrations completed successfully"

# Verify static files exist
if [ -d "app/static" ]; then
    echo "✅ Static files found: $(ls -la app/static | wc -l) files"
else
    echo "⚠️  No static files found - React frontend may not be built"
fi

# Start the application with proper error handling
echo "🌐 Starting FastAPI application on 0.0.0.0:$PORT..."
exec python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT --log-level info --access-log
