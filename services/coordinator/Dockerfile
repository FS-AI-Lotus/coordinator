# Multi-stage build for optimized production image
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies (better layer caching)
COPY package*.json ./
# Use npm install instead of npm ci to handle lock file sync issues
# For production, only install production dependencies
RUN npm install --omit=dev --no-audit --no-fund && npm cache clean --force

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy dependencies from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy application code (explicitly exclude root server.js if it exists)
COPY . .
# Explicitly remove any root server.js that might have been copied
RUN rm -f server.js 2>/dev/null || true

# Copy healthcheck script
COPY healthcheck.js ./

# Add healthcheck (uses PORT env var)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD ["node", "healthcheck.js"]

EXPOSE 3000

# Use node directly (no npm overhead in production)
CMD ["node", "src/index.js"]
