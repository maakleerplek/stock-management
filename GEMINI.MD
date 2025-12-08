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
  - Caddy as reverse proxy, Nginx for static serving in some setups
- DevOps:
  - Docker & Docker Compose for local/dev/prod
- Default URLs (Docker) Check the .env for relevent ulr's:
  - Frontend: http://localhost:8081
  - Backend API: http://localhost:8001
  - InvenTree: http://localhost:8000

## Styling & UI Rules

- This project uses **Material-UI**, **not Tailwind** and **not shadcn/ui**.
- Do **not**:
  - Add Tailwind, shadcn/ui, or change the styling system.
  - Replace MUI components with shadcn or Tailwind-based components.
- Do:
  - Use MUI patterns and theming (see `frontend/src/theme.ts`).
  - Keep existing structure of components in `frontend/src/components`.


## Project Structure (Important Paths)

- `frontend/src/components/` – React UI components
- `frontend/src/App.tsx` – main React application component
- `frontend/src/theme.ts` – MUI theme configuration
- `frontend/src/sendCodeHandler.tsx` – frontend → backend API communication
- `frontend/src/ToastContext.tsx` – toast notification system
- `backend/main.py` – FastAPI server entrypoint
- `backend/inventree_client.py` – InvenTree integration
- `docker-compose.yml` – Docker services
- `Caddyfile` – Caddy configuration
- `Inventree-data` – All inventree data


## Development & Environment

- Docker (recommended):
  - `docker compose up -d --build`


## Behaviors to Avoid

- Do not:
  - Suggest changing the tech stack (React/TS/MUI/FastAPI/InvenTree/Postgres).
  - Replace the architecture (e.g., switching to Next.js, Tailwind, or other UI kits).
  - Rewrite the whole project when only small changes are needed.

## Behaviors to Prefer

- Use:
  - Type-safe React patterns (modern hooks, strict TypeScript).
  - MUI best
