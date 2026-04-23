#!/usr/bin/env bash
set -e

cd "$(dirname "$0")"

echo "Installing backend dependencies..."
cd backend
npm install

echo "Starting backend on port 3000..."
node server.js