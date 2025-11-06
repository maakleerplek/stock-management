# stock-management
inventree stock management and frontend

#### implemented:
- barcode scanning
- item display
- item removing
- make it work on phone

#### to be implemented:
- better website reliability
- shopping cart feature
- better payment system
- better phone reliablility



# Installation docs 
https://docs.inventree.org/en/stable/start/docker_install/#initial-database-setup

## docker-compose-inventree

1. Get docker-compose.yml (here put in docker-compose-inventree.yml) + .env + Caddyfile
2. run `docker compose -f docker-compose-inventree run --rm inventree-server invoke update` to set everything up
3. run `docker compose -f docker-compose-inventree up -d` to start the containers

