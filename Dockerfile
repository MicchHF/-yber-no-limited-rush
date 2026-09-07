# Multi-stage Dockerfile for UNLIMITED RUSH
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and build app
COPY . .
RUN npm run build

# Production Runner
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy package manifests & production node_modules
COPY package*.json ./
RUN npm ci --omit=dev

# Copy compiled artifacts from builder
COPY --from=builder /app/dist ./dist

# Expose container port
EXPOSE 3000

# Persistent volume for local leaderboard and cloud saves
VOLUME ["/app/data"]

CMD ["npm", "start"]
