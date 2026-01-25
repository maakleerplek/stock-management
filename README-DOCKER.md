# Stock Management System - Docker Setup

A modern React frontend with FastAPI backend for inventory management, integrated with InvenTree.

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)

### Setup Instructions

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd stock-management
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your settings (especially SITE_DOMAIN)
   ```

3. **Start Services**
   ```bash
   docker compose up -d --build
   ```

4. **Access Applications**
   - **Frontend**: https://localhost/
   - **Backend API**: https://localhost/api/
   - **InvenTree**: https://localhost:8443/

## Docker Architecture

### Services Overview

| Service | Internal Port | Description |
|---------|---------------|-------------|
| caddy | 80, 443, 8443 | Reverse proxy (single entry point) |
| frontend | 80 | React application |
| backend | 8001 | FastAPI server |
| inventree-server | 8000 | InvenTree web interface |
| inventree-db | 5432 | PostgreSQL database |
| inventree-cache | 6379 | Redis cache |

### URL Routing (via Caddy)
```
https://{SITE_DOMAIN}/           -> frontend:80
https://{SITE_DOMAIN}/api/*      -> backend:8001
https://{SITE_DOMAIN}:8443/      -> inventree-server:8000
https://{SITE_DOMAIN}:8443/static/* -> Static files
https://{SITE_DOMAIN}:8443/media/*  -> Media files
```

## Development

### Local Development

#### Frontend
```bash
cd frontend
npm install
npm run dev
# http://localhost:5173
```

#### Backend
```bash
cd backend
pip install -r requirements.txt
python main.py
# http://localhost:8001
```

### Docker Commands

```bash
# Build and start all services
docker compose up -d --build

# View logs
docker compose logs -f caddy
docker compose logs -f frontend
docker compose logs -f backend

# Rebuild specific service
docker compose up -d --build frontend

# Stop all services
docker compose down

# Stop and remove volumes (clean slate)
docker compose down -v
```

## Configuration

### Environment Variables (.env)

```bash
# Domain configuration
SITE_DOMAIN=localhost           # Your domain or IP
HTTP_PORT=80                    # HTTP port
HTTPS_PORT=443                  # HTTPS port

# Frontend
VITE_BACKEND_URL=/api           # API endpoint (relative)
VITE_INVENTREE_URL=/inventree   # InvenTree endpoint (relative)
VITE_VOLUNTEER_PASSWORD=volunteer

# Backend
INVENTREE_URL=http://inventree-server:8000
INVENTREE_TOKEN=your_inventree_api_token

# Database
INVENTREE_DB_USER=pguser
INVENTREE_DB_PASSWORD=changeme_db_password
INVENTREE_DB_NAME=inventree
```

### Volume Persistence

- **Database**: `./inventree-data` (PostgreSQL data)
- **Media**: `./inventree-data/media` (InvenTree uploads)
- **Static**: `./inventree-data/static` (Generated files)

## Security

### Production Deployment

1. **Change Default Passwords**
   - Update `VITE_VOLUNTEER_PASSWORD`
   - Change InvenTree admin credentials
   - Use strong database passwords

2. **Configure Domain**
   - Set `SITE_DOMAIN` to your actual domain
   - Caddy will automatically obtain SSL certificates

3. **Environment Security**
   - Never commit `.env` file
   - Use strong, unique passwords

## Troubleshooting

### Common Issues

#### Certificate Warnings (localhost)
When using `localhost`, Caddy generates self-signed certificates. Accept the certificate warning in your browser.

#### Port Conflicts
```bash
# Check if ports are in use
netstat -tulpn | grep :80
netstat -tulpn | grep :443

# Stop conflicting services or change ports in .env
```

#### Build Failures
```bash
# Clean rebuild
docker compose down -v
docker system prune -f
docker compose up -d --build
```

#### Check Service Health
```bash
docker compose ps
docker compose logs [service-name]
```

### Viewing Logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f caddy
docker compose logs -f backend
docker compose logs -f inventree-server
```

## Documentation

- **AGENTS.md**: Development guidelines
- **Backend API**: https://localhost/api/docs (Swagger UI)
- **InvenTree**: https://docs.inventree.org
