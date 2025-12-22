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

# Stage 2: Serve built application with lightweight web server
FROM nginx:alpine AS production

# Install curl for health checks
RUN apk add --no-cache curl

# Copy built app
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 85

CMD ["nginx", "-g", "daemon off;"]