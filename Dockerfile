# Multi-stage build for production optimization
FROM node:20-alpine AS base

WORKDIR /app

# Install security updates
RUN apk update && apk add --no-cache dumb-init

# Copy package files
COPY backend/package*.json ./

# Install production dependencies only
RUN npm ci --only=production && npm cache clean --force

# Build stage - create final production image
FROM node:20-alpine

WORKDIR /app

# Copy dumb-init from base stage (safer init process for containers)
COPY --from=base /usr/bin/dumb-init /usr/bin/dumb-init

# Copy installed node_modules from base stage
COPY --from=base /app/node_modules ./node_modules

# Copy application code
COPY backend/src ./src
COPY backend/package.json .

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:4000/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["node", "src/index.js"]

# Expose port
EXPOSE 4000

# Metadata
LABEL version="1.0" description="Bytelink Backend API"
