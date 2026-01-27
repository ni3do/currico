# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat openssl

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

COPY package.json package-lock.json* ./

# Use cache mount for faster dependency installation
RUN --mount=type=cache,target=/root/.npm \
    npm ci --prefer-offline

# Build the application
FROM base AS builder
WORKDIR /app

# Skip telemetry and Sentry source map upload during build
ENV NEXT_TELEMETRY_DISABLED=1
ENV SENTRY_SUPPRESS_TURBOPACK_WARNING=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client and build with Next.js cache
RUN --mount=type=cache,target=/root/.cache/prisma \
    --mount=type=cache,target=/app/.next/cache \
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

# Copy prisma files and dependencies from builder (already generated)
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/lib ./lib
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma

# Install only runtime dependencies needed for migrations/bootstrap
RUN --mount=type=cache,target=/root/.npm \
    npm install --no-save bcryptjs tsx dotenv

# Copy startup script
COPY --from=builder /app/scripts/start.sh ./start.sh
RUN chmod +x ./start.sh

# Copy build artifacts last - these change most frequently
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy instrumentation file for OpenTelemetry
COPY --from=builder /app/instrumentation.ts ./instrumentation.ts

# Set final ownership
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

CMD ["./start.sh"]
