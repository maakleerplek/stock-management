# AGENTS.md - Stock Management System Development Guide

## Project Overview
A modern inventory management system with React/TypeScript frontend and Python FastAPI backend, integrating with InvenTree for inventory management. Features barcode scanning, shopping cart, and payment processing.

## Network Architecture

All traffic routes through Caddy reverse proxy with automatic HTTPS.

### Access Methods

**Via Domain Names** (requires hosts file setup):
```
https://stock.local/           -> Frontend (React)
https://stock.local/api/       -> Backend API (FastAPI)
https://inventree.local/       -> InvenTree (full UI)
```

**Via IP Address** (for mobile devices / network access):
```
https://192.168.68.65/         -> Frontend (React)
https://192.168.68.65/api/     -> Backend API (FastAPI)
https://192.168.68.65:8443/    -> InvenTree (separate port)
```

### Architecture Diagram
```
                    ┌─────────────────────────────────────┐
                    │      Caddy Reverse Proxy            │
                    │      (Ports 80, 443, 8443)          │
                    └─────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
          ▼                   ▼                   ▼
    ┌──────────┐       ┌──────────┐       ┌──────────────┐
    │ Frontend │       │ Backend  │       │  InvenTree   │
    │  (React) │       │ (FastAPI)│       │   (Django)   │
    │  :80     │       │  :8001   │       │    :8000     │
    └──────────┘       └──────────┘       └──────────────┘
                              │                   │
                              │                   │
                              ▼                   ▼
                    ┌─────────────────────────────────────┐
                    │         PostgreSQL + Redis          │
                    └─────────────────────────────────────┘
```

### Hosts File Setup (for domain access)

Add to your hosts file:
- **Windows**: `C:\Windows\System32\drivers\etc\hosts`
- **Linux/Mac**: `/etc/hosts`

```
127.0.0.1 stock.local
127.0.0.1 inventree.local
```

Or for network access (replace with your server IP):
```
192.168.68.65 stock.local
192.168.68.65 inventree.local
```

## Commands

### Frontend (React/TypeScript)
**Location**: `frontend/` directory
```bash
npm run dev      # Vite dev server (http://localhost:5173)
npm run build    # TypeScript compile + Vite build
npm run lint     # ESLint with React/TypeScript rules
npm run preview  # Production preview server
npx tsc -b       # TypeScript type checking
```

### Backend (Python FastAPI)
**Location**: `backend/` directory
```bash
pip install -r requirements.txt  # Install dependencies
python main.py                   # Run FastAPI server
python test_backend.py           # Run test suite
```

### Docker Commands (Recommended)
```bash
docker compose up -d --build     # Start all services
docker compose down              # Stop all services
docker compose logs -f [service] # View logs (caddy, backend, frontend, inventree-server)
docker compose restart [service] # Restart specific service
```

**Default URLs**:
| Access Method | Main App | InvenTree |
|---------------|----------|-----------|
| Domain | https://stock.local/ | https://inventree.local/ |
| IP Address | https://192.168.68.65/ | https://192.168.68.65:8443/ |

## Code Style Guidelines

### TypeScript & React
- **Strict TypeScript**: No `any` types unless absolutely necessary
- **Functional Components**: Use hooks only, no class components
- **Type-only Imports**: `import type { ComponentType } from './types'`
- **Interface Naming**: `PascalCase` (`ItemData`, `ApiResponse`)

### Import Organization (Frontend)
```typescript
// 1. React imports
import { useState, useEffect } from 'react';
// 2. Third-party libraries (MUI, etc.)
import { Box, Button } from '@mui/material';
// 3. Local imports
import { INVENTREE_CONFIG } from './constants';
import type { CartItem } from './types';
```

### Python Backend
- **PEP 8 Compliance**: Follow Python style guidelines
- **Type Hints**: Use proper type hints for all functions
- **Docstrings**: Comprehensive docstrings for modules and functions
- **Error Handling**: Use FastAPI's HTTPException for API errors
- **Pydantic Models**: Define request/response models with validation

### Naming Conventions
| Context | Convention | Example |
|---------|------------|---------|
| React Components | PascalCase | `ShoppingWindow.tsx` |
| TS Functions/Variables | camelCase | `handleAddItem` |
| TS Constants | UPPER_SNAKE_CASE | `API_CONFIG` |
| Python Functions | snake_case | `get_item_details` |
| Python Classes | PascalCase | `TakeItemRequest` |

### Error Handling
**Frontend**:
```typescript
try {
  const result = await apiCall();
} catch (error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  addToast(message, 'error');
}
```

**Backend**:
```python
from fastapi import HTTPException
try:
    result = await some_operation()
except Exception as e:
    raise HTTPException(status_code=500, detail=str(e))
```

### Material-UI Rules
- **Use MUI Only**: No Tailwind, shadcn/ui, or other UI libraries
- **Theme Consistency**: Follow patterns in `theme.ts`
- **Styling**: Use MUI's `sx` prop over custom CSS

### Configuration
- **Frontend**: Use `import.meta.env.VITE_*` for environment variables
- **Constants**: Centralized in `frontend/src/constants/index.ts`
- **InvenTree URL**: Dynamically constructed based on access method (domain vs IP)

## File Structure
```
├── docker-compose.yml       # Container orchestration
├── Caddyfile               # Reverse proxy config (HTTPS)
├── .env.example            # Environment template
├── frontend/
│   ├── src/
│   │   ├── constants/      # App configuration
│   │   ├── utils/          # Helper functions
│   │   ├── App.tsx         # Main application
│   │   ├── theme.ts        # MUI theme
│   │   └── sendCodeHandler.tsx  # API layer
│   └── Dockerfile
├── backend/
│   ├── main.py             # FastAPI entry
│   ├── inventree_client.py # InvenTree API client
│   ├── test_backend.py     # Test suite
│   └── Dockerfile
└── inventree-data/         # InvenTree persistent data
```

## Key Configuration Files
| File | Purpose |
|------|---------|
| `.env` | Environment variables (copy from `.env.example`) |
| `docker-compose.yml` | Service definitions and networking |
| `Caddyfile` | Reverse proxy routing rules (HTTPS) |
| `frontend/src/constants/index.ts` | Frontend configuration |

## Environment Variables
Key variables in `.env`:

| Variable | Description | Default |
|----------|-------------|---------|
| `SITE_DOMAIN` | Domain for main app | `stock.local` |
| `INVENTREE_DOMAIN` | Domain for InvenTree | `inventree.local` |
| `SITE_IP` | IP address for network access | `192.168.68.65` |
| `INVENTREE_TOKEN` | InvenTree API token | (required) |

## Copilot/Cursor Instructions
- Do NOT change tech stack (React/TS/MUI/FastAPI/InvenTree/PostgreSQL)
- Use Material-UI exclusively for styling
- Follow existing component patterns
- Use environment variables for configuration
- Keep API calls centralized in `sendCodeHandler.tsx`
