# ---------------------------------------------
# Stage 1: Build Production Frontend Assets
# ---------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

# Copy source code (expects .env to be present for Vite environment embedding)
COPY . .

RUN npm run build

# ---------------------------------------------
# Stage 2: Serve with Nginx High-Performance Web Server
# ---------------------------------------------
FROM nginx:alpine

# Copy custom Nginx SPA configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled static files
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
