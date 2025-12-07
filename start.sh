#!/bin/bash

#Startup Script
echo "🚀 Starting Todo App..."

#check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is not installed. Please install Node.js first."
    exit 1
fi

#check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "npm is not installed. Please install npm first."
    exit 1
fi

if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

#start server
echo "Starting server on http://localhost:3001"
echo "TOdo app available at: http://localhost:3001"
# echo "Press Ctrl+C to stop the server"
npm start
