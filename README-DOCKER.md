# InvenTree Stock Management System

A modern React frontend with FastAPI backend for inventory management, integrated with InvenTree.

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- Git

### Setup Instructions

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd stock-management
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

3. **Start Services**
   ```bash
   # Using the startup script (recommended)
   chmod +x start-dev.sh
   ./start-dev.sh
   
   # Or manually
   docker compose up --build -d
   ```

4. **Access Applications**
   - **Frontend**: http://localhost:8085
   - **Backend API**: http://localhost:8085/api
   - **InvenTree**: http://localhost (port 80)
   - **Caddy Proxy**: http://localhost:8085

## 🐳 Docker Architecture

### Services Overview

| Service | Port | Description |
|----------|-------|-------------|
| Frontend | 85 | React application (Nginx) |
| Backend | 8001 | FastAPI server |
| InvenTree | 8000 | InvenTree web interface |
| Proxy | 80, 443, 8085 | Caddy reverse proxy |
| Database | 5432 | PostgreSQL |
| Cache | 6379 | Redis |

### Service Communication
- **Frontend → Backend**: Via Caddy proxy `/api/*` → `backend:8001`
- **Backend → InvenTree**: Internal Docker network
- **Caddy**: Routes traffic to appropriate services

## 🛠️ Development

### Local Development

#### Frontend Development
```bash
cd frontend
npm install
npm run dev
# http://localhost:5173
```

#### Backend Development
```bash
cd backend
pip install -r requirements.txt
python main.py
# http://localhost:8001
```

### Docker Development

#### Build Individual Services
```bash
# Frontend only
docker compose build frontend

# Backend only
docker compose build backend

# All services
docker compose build
```

#### Service Management
```bash
# View logs
docker compose logs -f frontend
docker compose logs -f backend

# Stop services
docker compose down

# Rebuild specific service
docker compose up --build frontend
```

## 🔧 Configuration

### Environment Variables

Key variables in `.env`:

```bash
# Network
LOCAL_IP=10.46.213.212  # Your external IP

# Frontend
VITE_BACKEND_URL=/api
VITE_VOLUNTEER_PASSWORD=volunteer

# Backend
INVENTREE_URL=http://inventree-server:8000
INVENTREE_TOKEN=your_inventree_api_token

# Database
INVENTREE_DB_USER=inventree
INVENTREE_DB_PASSWORD=your_password
INVENTREE_DB_NAME=inventree
```

### Volume Persistence

- **Database**: `./inventree-data` (PostgreSQL data)
- **Media**: `./inventree-data/media` (InvenTree uploads)
- **Static**: `./inventree-data/static` (Generated files)
- **Logs**: `./inventree-data/logs` (Application logs)

## 🔒 Security

### Production Deployment

1. **Change Default Passwords**
   - Update `VITE_VOLUNTEER_PASSWORD`
   - Change InvenTree admin credentials
   - Use strong database passwords

2. **Network Security**
   - Configure firewall rules
   - Use HTTPS in production
   - Review Caddy configuration

3. **Environment Security**
   - Never commit `.env` file
   - Use Docker secrets for sensitive data
   - Enable authentication on all services

## 📊 Monitoring & Logs

### Health Checks
All services include health checks:
- **Frontend**: `GET /health`
- **Backend**: `GET /`
- **Database**: PostgreSQL connection check

### Log Locations
- **Application Logs**: `./inventree-data/logs/`
- **Nginx Access**: `./inventree-data/logs/caddy/`
- **Database Logs**: PostgreSQL container logs

View logs:
```bash
docker compose logs -f [service-name]
```

## 🐛 Troubleshooting

### Common Issues

#### Port Conflicts
```bash
# Check if ports are in use
netstat -tulpn | grep :8085
netstat -tulpn | grep :8001

# Kill conflicting processes
sudo lsof -ti:8085 | xargs kill -9
```

#### Build Failures
```bash
# Clean build cache
docker compose down --volumes
docker system prune -f
docker compose build --no-cache
```

#### Database Connection Issues
```bash
# Check database container
docker compose logs inventree-db

# Test connection
docker compose exec inventree-db psql -U inventree -d inventree -c "SELECT version();"
```

### Performance Optimization

1. **Frontend**: Code splitting enabled via Vite config
2. **Images**: Multi-stage builds for smaller production images
3. **Caching**: Redis for session and query caching
4. **Static Files**: Nginx serves static assets with gzip compression

## 📝 Development Workflow

### Code Quality
```bash
# Frontend
cd frontend
npm run lint          # Check code style
npm run build         # Production build
npm run preview       # Preview build

# Backend
cd backend
python test_backend.py  # Run tests
```

### Git Workflow
```bash
# Feature development
git checkout -b feature/new-feature
# Make changes
docker compose up --build frontend
# Test
git commit -m "Add new feature"
git push origin feature/new-feature
# Create pull request
```

## 📚 Documentation

- **Frontend**: `frontend/src/` - React components and utilities
- **Backend**: `backend/main.py` - FastAPI endpoints
- **API Documentation**: Available at `/docs` when backend is running
- **InvenTree**: https://docs.inventree.org

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with proper code style
4. Add tests for new functionality
5. Update documentation
6. Submit a pull request

### Code Standards
- Follow AGENTS.md guidelines
- Write tests for new features
- Update documentation for API changes
- Use semantic commit messages

## 📞 Support

For issues and questions:
1. Check this README for solutions
2. Review logs with `docker compose logs`
3. Check GitHub Issues for known problems
4. Create new issue with detailed information

---

**Version**: 1.0.0  
**Last Updated**: 2025-12-22