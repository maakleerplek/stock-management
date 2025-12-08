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
- Default URLs (Docker):
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

## How to Use MCP Tools for This Project

- When you need external information (React, TypeScript, MUI, FastAPI, InvenTree, Docker):
  - Prefer the **Perplexity MCP server** to search current documentation and best practices.
- When you need to inspect or modify project files (if a filesystem MCP is configured):
  - Use the filesystem MCP to read/write files under `frontend/` and `backend/`.
- Always:
  - Read existing code and component structure before suggesting big refactors.
  - Prefer minimal, focused changes that fit the existing architecture.

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

## Development & Environment

- Local frontend:
  - `cd frontend && npm install && npm run dev`
- Local backend:
  - `cd backend`
  - `python -m venv venv`
  - `source venv/bin/activate` (or `venv\Scripts\activate` on Windows)
  - `pip install -r requirements.txt`
  - `python main.py`
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
