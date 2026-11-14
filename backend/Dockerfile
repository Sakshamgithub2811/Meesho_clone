FROM node:20-alpine

WORKDIR /app

# Install OpenSSL & libc required by Prisma on Alpine Linux
RUN apk add --no-cache openssl libc6-compat

# Copy package descriptors & Prisma schema
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

# Copy the rest of the backend codebase
COPY . .

# Expose backend API port
EXPOSE 5000

# Push schema changes safely and start the Express server
CMD ["sh", "-c", "npx prisma db push --skip-generate || true; node index.js"]
