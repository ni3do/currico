# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat openssl

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

COPY package.json package-lock.json* ./

# Use cache mount for faster dependency installation
RUN --mount=type=cache,target=/root/.npm \
    npm ci

# Build the application
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Ensure public directory exists, generate Prisma client, and build
RUN --mount=type=cache,target=/root/.cache/prisma \
    mkdir -p public && \
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

# Copy package.json and prisma files first (needed for npm install, changes less often)
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

# Install runtime dependencies for migrations/seeding with cache
RUN --mount=type=cache,target=/root/.npm \
    --mount=type=cache,target=/root/.cache/prisma \
    npm install --no-save prisma @prisma/client @prisma/adapter-pg pg postgres-array bcryptjs tsx dotenv && \
    npx prisma generate

# Copy startup script
COPY --from=builder /app/scripts/start.sh ./start.sh
RUN chmod +x ./start.sh

# Copy build artifacts last - these change most frequently
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Set final ownership
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

CMD ["./start.sh"]
