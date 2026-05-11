# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Stage 2: Runtime (serve built app with nginx)
FROM nginx:1.25-alpine

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built app from builder stage to nginx html directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port for nginx
EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
