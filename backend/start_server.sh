#!/bin/bash
set -e
pip install --upgrade pip
pip install -r requirements.txt
cd ../frontend/react-app
npm install
npm run build
cp -r build/* ../../backend/app/static/
cd ../../backend
uvicorn app.main:app --host 0.0.0.0 --port 8080
