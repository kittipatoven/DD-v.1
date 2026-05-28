# Multi-stage build for Next.js frontend
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Accept build arguments
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_WS_URL
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID

# Set environment for build
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_WS_URL=${NEXT_PUBLIC_WS_URL}
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=${NEXT_PUBLIC_GOOGLE_CLIENT_ID}

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Create necessary directories
RUN mkdir -p .next/static .next/standalone

# Copy package files
COPY package*.json ./

# Install only production dependencies and curl for health check
RUN npm install --only=production && npm cache clean --force && apk add --no-cache curl

# Copy built application from builder stage (standalone output)
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Expose port
EXPOSE 3000

# Start the application (standalone server.js)
CMD ["node", "server.js"]
