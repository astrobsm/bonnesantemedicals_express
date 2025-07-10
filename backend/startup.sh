#!/bin/bash
set -e

echo "🚀 Starting AstroBSM deployment..."

# Test database connection first
echo "🔌 Testing database connection..."
python test_db_connection.py

# Fix alembic_version column if needed
echo "🔧 Fixing alembic_version column if needed..."
python fix_alembic_version_column.py

# Run database migrations
echo "📊 Running database migrations..."
python -m alembic upgrade head
echo "✅ Migrations completed successfully"

# Start the application
echo "🌐 Starting FastAPI application..."
exec python -m uvicorn app.main:app --host 0.0.0.0 --port 8080 --log-level info
