# Stage 1: Build React application
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build arguments for Vite environment variables
ARG VITE_BACKEND_URL=/api
ARG VITE_INVENTREE_URL=http://inventree.localhost
ARG VITE_VOLUNTEER_PASSWORD=volunteer

# Set environment variables for build
ENV VITE_BACKEND_URL=${VITE_BACKEND_URL}
ENV VITE_INVENTREE_URL=${VITE_INVENTREE_URL}
ENV VITE_VOLUNTEER_PASSWORD=${VITE_VOLUNTEER_PASSWORD}

RUN npm run build

# Stage 2: Serve with lightweight static server
FROM nginx:alpine AS production

# Copy built app to nginx html directory
COPY --from=build /app/dist /usr/share/nginx/html

# Simple nginx config for SPA
RUN echo 'server { \
    listen 80; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    location /health { \
        return 200 "ok"; \
        add_header Content-Type text/plain; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -q --spider http://127.0.0.1/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
