#!/bin/bash

# Docker Compose Development Startup Script
# This script starts the entire stock management system

set -e

echo "🚀 Starting InvenTree Stock Management System..."
echo "========================================"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found!"
    echo "Please copy .env.example to .env and configure your settings."
    exit 1
fi

echo "✅ Environment file found"

# Build and start all services
echo "📦 Building and starting services..."
docker compose up --build -d

echo ""
echo "🌐 Services are starting up..."
echo "📊 InvenTree: http://localhost:${INVENTREE_HTTP_PORT:-80}"
echo "🔧 Backend API: http://localhost:8085/api"
echo "🖥️ Frontend: http://localhost:8085"
echo "📱 Volunteer Mode: Available in frontend"

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if services are healthy
echo "🔍 Checking service health..."
docker compose ps

echo ""
echo "📝 Useful Commands:"
echo "  View logs:          docker compose logs -f [service-name]"
echo "  Stop services:       docker compose down"
echo "  Rebuild frontend:    docker compose up --build frontend"
echo "  Rebuild backend:     docker compose up --build backend"

echo ""
echo "✅ All services started successfully!"
echo "📚 Documentation: Check README.md for detailed setup instructions"