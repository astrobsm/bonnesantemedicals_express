#!/bin/bash
set -e

echo "Starting build process..."

# Install Python dependencies
echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Build frontend
echo "Building React frontend..."
cd ../frontend/react-app
npm install
NODE_ENV=production npm run build

# Copy frontend build to backend static directory
echo "Copying frontend build to backend static directory..."
mkdir -p ../../backend/app/static
cp -r build/* ../../backend/app/static/

# Return to backend directory
cd ../../backend

# Run database migrations
echo "Running database migrations..."
python -m alembic upgrade head

echo "Build process completed successfully!"
