#!/bin/bash

# HydrIA integrated startup script

# Find the directory of this script so it can be run from anywhere
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "======================================"
echo "Starting HydrIA API..."
echo "======================================"
cd "$DIR/web/api"
npm run dev &
API_PID=$!

# Give the API a moment to start
sleep 2

echo "======================================"
echo "Starting HydrIA Frontend..."
echo "======================================"
cd "$DIR/web/frontend"
npm run dev &
FRONTEND_PID=$!

echo "======================================"
echo "✅ Everything is running!"
echo "- API is on http://localhost:3001"
echo "- Frontend is usually on http://localhost:5173"
echo ""
echo "Press Ctrl+C to shut them both down."
echo "======================================"

# Trap SIGINT (Ctrl+C) to gracefully exit both Node applications
trap "echo 'Shutting down services...'; kill $API_PID; kill $FRONTEND_PID; exit" SIGINT SIGTERM

wait $API_PID $FRONTEND_PID
