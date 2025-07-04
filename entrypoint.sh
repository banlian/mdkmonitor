#!/bin/bash

# Exit on any error
set -e

# Set production environment
export NODE_ENV=production

# Check if .next directory exists
if [ ! -d ".next" ]; then
    echo "Error: .next directory not found. Please run 'npm run build' first."
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm ci --only=production
fi

# Start the Next.js production server
echo "Starting Next.js production server..."
exec npm start 