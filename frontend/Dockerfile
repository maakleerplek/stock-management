# Stage 1: Build React application
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build with environment variables
# Default value provides fallback for local development if not provided via docker-compose
ARG VITE_BACKEND_URL=/api
ARG VITE_VOLUNTEER_PASSWORD=volunteer
ENV VITE_BACKEND_URL=${VITE_BACKEND_URL}
ENV VITE_VOLUNTEER_PASSWORD=${VITE_VOLUNTEER_PASSWORD}

RUN npm run build

# Stage 2: Serve built application with nginx
FROM nginx:alpine AS production

# Copy built app to nginx html directory
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Simple health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/health || exit 1

CMD ["nginx", "-g", "daemon off;"]