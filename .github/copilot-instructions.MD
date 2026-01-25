# Project Instructions – Stock Management System

## Tech & Architecture

- Frontend:
  - React 19.1 with **TypeScript 5.8**
  - **Material-UI (MUI) 5.15** as the primary component library
  - Vite 7.1 as the build tool
  - html5-qrcode for barcode/QR scanning
- Backend:
  - Python FastAPI API
  - InvenTree as the inventory system
  - PostgreSQL database
  - Caddy as single reverse proxy for all services
- DevOps:
  - Docker & Docker Compose for local/dev/prod

## Network Architecture

All traffic routes through Caddy reverse proxy on a single domain:
```
https://{SITE_DOMAIN}/           -> Frontend (React)
https://{SITE_DOMAIN}/api/       -> Backend API (FastAPI)
https://{SITE_DOMAIN}/inventree/ -> InvenTree UI
https://{SITE_DOMAIN}/static/    -> InvenTree static files
https://{SITE_DOMAIN}/media/     -> InvenTree media files
```

Default URLs (with `SITE_DOMAIN=localhost`):
- Application: https://localhost/
- Backend API: https://localhost/api/
- InvenTree: https://localhost/inventree/

## Styling & UI Rules

- This project uses **Material-UI**, **not Tailwind** and **not shadcn/ui**.
- Do **not**:
  - Add Tailwind, shadcn/ui, or change the styling system.
  - Replace MUI components with shadcn or Tailwind-based components.
- Do:
  - Use MUI patterns and theming (see `frontend/src/theme.ts`).
  - Keep existing structure of components in `frontend/src/`.

## Project Structure (Important Paths)

- `frontend/src/constants/` – Application configuration
- `frontend/src/App.tsx` – main React application component
- `frontend/src/theme.ts` – MUI theme configuration
- `frontend/src/sendCodeHandler.tsx` – frontend → backend API communication
- `frontend/src/ToastContext.tsx` – toast notification system
- `backend/main.py` – FastAPI server entrypoint
- `backend/inventree_client.py` – InvenTree integration
- `docker-compose.yml` – Docker services
- `Caddyfile` – Reverse proxy configuration
- `inventree-data/` – All InvenTree data

## Development & Environment

- Docker (recommended):
  - `docker compose up -d --build`

## Behaviors to Avoid

- Do not:
  - Suggest changing the tech stack (React/TS/MUI/FastAPI/InvenTree/Postgres).
  - Replace the architecture (e.g., switching to Next.js, Tailwind, or other UI kits).
  - Rewrite the whole project when only small changes are needed.
  - Use hardcoded URLs - always use constants from `frontend/src/constants/`

## Behaviors to Prefer

- Use:
  - Type-safe React patterns (modern hooks, strict TypeScript).
  - MUI best practices and theming.
  - Relative URLs via constants (`/api`, `/inventree`).
  - Environment variables for configuration.
