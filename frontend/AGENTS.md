# AGENTS.md - Stock Management System Development Guide

## Commands
- **Build**: `npm run build` (TypeScript compile + Vite build)
- **Lint**: `npm run lint` (ESLint with React/TypeScript rules)
- **Dev**: `npm run dev` (Vite dev server)
- **Preview**: `npm run preview` (production preview)
- **Docker Start**: `./start-dev.sh` (Starts all services with Docker Compose)
- **Docker Build**: `docker compose build frontend` (Build only frontend container)

## Code Style Guidelines

### TypeScript & React
- Use strict TypeScript - no `any` types unless absolutely necessary
- Functional components with hooks only (no class components)
- Type-only imports: `import type { ComponentType } from './types'`
- Interface names: `PascalCase` with descriptive names (`ItemData`, `ApiResponse`)

### Import Organization
1. React imports first
2. Third-party libraries (MUI, etc.)
3. Local imports (type imports last, prefixed with `type`)

### Naming Conventions
- Components: `PascalCase`
- Functions/variables: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Files: `PascalCase.tsx` for components, `camelCase.ts` for utilities

### Error Handling
- Use try-catch with proper error typing: `catch (error: unknown)`
- Type error checking: `error instanceof Error ? error.message : String(error)`
- Never expose sensitive data in error messages

### Material-UI Rules
- Use MUI components only - no Tailwind, shadcn/ui, or other UI libraries
- Follow existing theming patterns in `theme.ts`
- Prefer MUI's built-in styling over custom CSS

### Security
- Move hardcoded credentials to environment variables
- Never commit secrets, passwords, or API keys
- Use environment variable fallbacks: `import.meta.env.VITE_VAR || 'default'`

### File Structure
- Keep components in `src/` following existing patterns
- Utility functions: descriptive names with clear purposes
- API calls: centralized in `sendCodeHandler.tsx` pattern