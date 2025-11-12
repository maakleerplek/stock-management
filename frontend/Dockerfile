# Stage 1: Build the React application
FROM node:20 AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN npm run build

# Install serve to act as a static file server
RUN npm install -g serve

# Start the server
CMD ["serve", "-s", "dist", "-l", "80"]

