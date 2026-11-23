FROM node:22-slim

WORKDIR /app

# Install OpenSSL required by Prisma query engine
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

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

# Start the Express server
CMD ["node", "index.js"]
