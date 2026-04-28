# InvenTree Deployment

A production-ready [InvenTree](https://inventree.org/) inventory management system deployment using Docker Compose with PostgreSQL, Redis cache, and Caddy reverse proxy.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue)](https://www.docker.com/)
[![InvenTree](https://img.shields.io/badge/InvenTree-Stable-green)](https://inventree.org/)

## Features

- **📦 InvenTree** - Open-source inventory management system
- **🗄️ PostgreSQL 17** - Reliable database backend
- **⚡ Redis** - High-performance caching
- **🔒 Caddy** - Automatic HTTPS with reverse proxy
- **🐳 Docker Compose** - Simple deployment and management
- **🌐 CORS Enabled** - Ready for frontend integrations

## Tech Stack

- **InvenTree** - Inventory management platform
- **PostgreSQL 17** - Database
- **Redis 7** - Cache manager
- **Caddy** - Reverse proxy with automatic SSL
- **Docker & Docker Compose** - Containerization

## Quick Start

### Prerequisites

- Docker & Docker Compose installed
- Basic understanding of Docker containers

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/maakleerplek/stock-management.git
   cd stock-management
   ```

2. **Configure environment**

   Copy the example environment file and configure it:

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and update the following important variables:
   
   - `INVENTREE_SITE_URL` - Your InvenTree URL (e.g., `https://10.72.3.141:8443`)
   - `INVENTREE_ADMIN_USER` - Admin username
   - `INVENTREE_ADMIN_PASSWORD` - Admin password  
   - `INVENTREE_ADMIN_EMAIL` - Admin email
   - `INVENTREE_DB_PASSWORD` - Database password (change from default!)

3. **Start InvenTree**

   ```bash
   docker compose up -d
   ```

4. **Access InvenTree**

   Open your browser and navigate to the URL specified in `INVENTREE_SITE_URL`.

   > **Note:** If using a local IP address (e.g., `https://10.72.3.141:8443`), your browser will show a security warning because Caddy generates self-signed certificates for local development. This is normal - click "Advanced" and "Proceed" to continue.

## Project Structure

```
stock-management/
├── docker-compose.yml          # Container orchestration
├── Caddyfile                   # Reverse proxy configuration
├── .env                        # Environment variables (create from .env.example)
├── .env.example                # Example environment configuration
├── inventree-data/             # InvenTree persistent data
├── inventree-configs/          # InvenTree configuration files
├── Standard-Inventreesetup/    # Reference standard InvenTree setup
├── logs/                       # Application logs
└── README.md                   # This file
```

## Docker Services

The `docker-compose.yml` file defines the following services:

- **inventree-db** - PostgreSQL 17 database
- **inventree-cache** - Redis 7 cache server
- **inventree-server** - InvenTree web application
- **inventree-worker** - Background task processor
- **inventree-proxy** - Caddy reverse proxy

## Configuration

### Environment Variables

Key variables in `.env`:

| Variable | Description | Default |
|----------|-------------|---------|
| `INVENTREE_TAG` | InvenTree version (stable/latest/x.x.x) | `stable` |
| `INVENTREE_SITE_URL` | Public URL for InvenTree | `https://inventree.localhost` |
| `INVENTREE_DB_USER` | Database username | `pguser` |
| `INVENTREE_DB_PASSWORD` | Database password | **Change this!** |
| `INVENTREE_ADMIN_USER` | Initial admin username | (optional) |
| `INVENTREE_ADMIN_PASSWORD` | Initial admin password | (optional) |
| `INVENTREE_CORS_ORIGIN_ALLOW_ALL` | Enable CORS for all origins | `True` |
| `INVENTREE_HTTP_PORT` | HTTP port for Caddy | `80` |
| `INVENTREE_HTTPS_PORT` | HTTPS port for Caddy | `443` |

For a complete list of configuration options, see the [InvenTree documentation](https://docs.inventree.org/en/stable/start/config/).

### CORS Configuration

This deployment has CORS enabled (`INVENTREE_CORS_ORIGIN_ALLOW_ALL=True`) to allow frontend applications to communicate with the InvenTree API. If you need more restrictive CORS settings, modify this variable in your `.env` file.

## Usage

### Managing Containers

```bash
# Start all services
docker compose up -d

# Stop all services
docker compose down

# View logs
docker compose logs -f

# View logs for specific service
docker compose logs -f inventree-server

# Restart a service
docker compose restart inventree-server

# Check service status
docker compose ps
```

### Updating InvenTree

To update to a new version of InvenTree:

1. Change `INVENTREE_TAG` in `.env` (e.g., `INVENTREE_TAG=0.16.0`)
2. Pull the new image and restart:

```bash
docker compose pull
docker compose up -d
```

### Backup and Restore

**Backup:**

```bash
# Backup database
docker exec inventree-db pg_dump -U pguser inventree > backup.sql

# Backup data volume
tar -czf inventree-data-backup.tar.gz ./inventree-data/
```

**Restore:**

```bash
# Restore database
cat backup.sql | docker exec -i inventree-db psql -U pguser inventree

# Restore data volume
tar -xzf inventree-data-backup.tar.gz
```

## Troubleshooting

### Container won't start

```bash
# Check logs
docker compose logs

# Verify environment variables
docker compose config
```

### Database connection issues

1. Ensure `inventree-db` container is running: `docker compose ps`
2. Check database credentials in `.env`
3. View database logs: `docker compose logs inventree-db`

### Permission issues with volumes

```bash
# Fix permissions on inventree-data directory
sudo chown -R 1000:1000 ./inventree-data/
```

### Cannot access InvenTree web interface

1. Check if all containers are running: `docker compose ps`
2. Verify `INVENTREE_SITE_URL` in `.env`
3. Check Caddy logs: `docker compose logs inventree-proxy`
4. Ensure firewall allows traffic on configured ports

## Security Considerations

- **Change default passwords** - Update `INVENTREE_DB_PASSWORD` and admin credentials
- **Use strong passwords** - Especially for production deployments
- **Enable HTTPS** - Caddy provides automatic HTTPS with Let's Encrypt
- **Regular backups** - Schedule automated backups of database and data volumes
- **Update regularly** - Keep InvenTree and Docker images up to date

## Development

For local development with custom frontend applications:

1. InvenTree API is accessible at the URL specified in `INVENTREE_SITE_URL`
2. CORS is enabled by default for all origins
3. Generate API tokens in InvenTree: Settings → API Tokens
4. Use the token in your frontend application to authenticate API requests

## Related Repositories

- **Frontend**: [Stock-management-frontend](https://github.com/maakleerplek/Stock-management-frontend) - React/TypeScript frontend for InvenTree

## Documentation

- [InvenTree Documentation](https://docs.inventree.org/)
- [InvenTree GitHub](https://github.com/inventree/InvenTree)
- [Caddy Documentation](https://caddyserver.com/docs/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For issues, questions, or suggestions:

- InvenTree Issues: [GitHub Issues](https://github.com/inventree/InvenTree/issues)
- InvenTree Community: [Discussion Forum](https://github.com/inventree/InvenTree/discussions)
- Deployment Issues: Create an issue in this repository

## Acknowledgments

- [InvenTree](https://inventree.org/) - Open-source inventory management
- [PostgreSQL](https://www.postgresql.org/) - Database system
- [Redis](https://redis.io/) - Cache manager
- [Caddy](https://caddyserver.com/) - Modern web server

---

**Deployed by [Maakleerplek VZW](https://maakleerplek.be) | High Tech Lab**
