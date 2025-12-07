# Stage 1: Build the React application
FROM node:20 AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

# Build with environment variables
ARG VITE_BACKEND_URL
RUN VITE_BACKEND_URL=${VITE_BACKEND_URL} npm run build

# Stage 2: Serve the built application
FROM node:20-alpine

WORKDIR /app

RUN npm install -g serve

COPY --from=build /app/dist ./dist

EXPOSE 80

CMD ["serve", "-s", "dist", "-l", "80"]

