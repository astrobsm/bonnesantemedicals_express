#!/bin/bash
set -e

echo "Starting AstroBSM application..."

# Check if alembic.ini exists
if [ ! -f "alembic.ini" ]; then
    echo "alembic.ini not found! Creating it..."
    # You could copy from a template here if needed
    exit 1
fi

# Run database migrations
echo "Running database migrations..."
python -m alembic upgrade head

# Start the application
echo "Starting uvicorn server..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8080
