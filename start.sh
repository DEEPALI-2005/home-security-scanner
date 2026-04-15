#!/bin/bash
set -e

echo "🔨 Building frontend..."
cd frontend
npm install
npm run build
cd ..

echo "🚀 Starting backend server..."
cd backend
npm install
node server.js
