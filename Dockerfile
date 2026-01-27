# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat openssl

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

COPY package.json package-lock.json* ./

# Install dependencies (no cache to ensure correct versions)
RUN npm cache clean --force && npm ci

# Build the application
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Ensure public directory exists, generate Prisma client, and build
RUN mkdir -p public && \
    npm run db:generate && \
    npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# System setup - rarely changes, cache this layer
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    mkdir .next && \
    chown nextjs:nodejs .next

# Copy build artifacts first (standalone includes minimal node_modules)
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy package.json and prisma files
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

# Copy startup script
COPY --from=builder /app/scripts/start.sh ./start.sh
RUN chmod +x ./start.sh

# Copy instrumentation file for OpenTelemetry
COPY --from=builder /app/instrumentation.ts ./instrumentation.ts

# Install runtime dependencies for migrations/seeding
# Remove standalone's minimal node_modules and install fresh with Prisma 7 + MariaDB adapter
RUN rm -rf node_modules && \
    npm cache clean --force && \
    npm install --no-save prisma@7.2.0 @prisma/client@7.2.0 @prisma/adapter-mariadb@7.2.0 bcryptjs tsx dotenv next react react-dom && \
    ./node_modules/.bin/prisma generate && \
    ./node_modules/.bin/prisma --version

# Set final ownership
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

CMD ["./start.sh"]
