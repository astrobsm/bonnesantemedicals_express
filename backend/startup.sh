#!/bin/bash
set -e

echo "🚀 Starting AstroBSM deployment..."

# Run database migrations
echo "📊 Running database migrations..."
python -m alembic upgrade head
echo "✅ Migrations completed successfully"

# Start the application
echo "🌐 Starting FastAPI application..."
exec python -m uvicorn app.main:app --host 0.0.0.0 --port 8080 --log-level info
