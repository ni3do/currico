# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
# libc6-compat: glibc compatibility
# openssl: TLS/SSL support
# su-exec: drop privileges for entrypoint
# cairo, pango, etc: required for sharp/canvas/pdf-to-img PDF rendering
RUN apk add --no-cache \
    libc6-compat \
    openssl \
    su-exec \
    cairo \
    pango \
    giflib \
    libjpeg-turbo \
    librsvg \
    pixman

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
# Disable Sentry source map upload in Docker builds
ENV SENTRY_SUPPRESS_UPLOADING_SOURCEMAPS=1

COPY --from=deps /app/node_modules ./node_modules

# Copy config files first (change less frequently)
COPY package.json package-lock.json tsconfig.json next.config.ts postcss.config.mjs ./
COPY prisma.config.ts sentry.*.config.ts proxy.ts ./
COPY i18n ./i18n

# Copy Prisma schema (changes infrequently)
COPY prisma ./prisma

# Generate Prisma client (cached separately from build)
RUN --mount=type=cache,target=/root/.cache/prisma \
    npm run db:generate

# Copy source files (change most frequently) - ordered by change frequency
COPY public ./public
COPY messages ./messages
COPY components ./components
COPY lib ./lib
COPY app ./app
COPY instrumentation.ts ./

# Copy scripts needed for runtime
COPY scripts ./scripts

# Build with Next.js cache
RUN --mount=type=cache,target=/app/.next/cache \
    npm run build

# Prune node_modules to production dependencies only
FROM base AS pruner
WORKDIR /app

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json

# Install production dependencies + tsx (needed for runtime scripts)
# Use --ignore-scripts to skip husky prepare script (dev dependency)
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev --prefer-offline --ignore-scripts && \
    npm install tsx --prefer-offline --ignore-scripts

# Copy pre-generated Prisma client
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# System setup - rarely changes, cache this layer
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    mkdir -p .next uploads && \
    chown nextjs:nodejs .next uploads

# Copy package.json for runtime reference
COPY --from=builder /app/package.json ./package.json

# Copy Prisma files needed for migrations
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/lib ./lib

# Copy pruned node_modules with all production dependencies
COPY --from=pruner /app/node_modules ./node_modules

# Copy startup scripts with correct ownership
COPY --from=builder --chown=nextjs:nodejs /app/scripts/start.sh ./start.sh
COPY --from=builder --chown=nextjs:nodejs /app/scripts/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./start.sh ./entrypoint.sh

# Copy build artifacts with correct ownership (most frequent changes - copy last)
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy instrumentation file for OpenTelemetry
COPY --from=builder /app/instrumentation.ts ./instrumentation.ts

EXPOSE 3000

# Run entrypoint as root to fix permissions, then drop to nextjs
ENTRYPOINT ["./entrypoint.sh"]
CMD ["./start.sh"]
