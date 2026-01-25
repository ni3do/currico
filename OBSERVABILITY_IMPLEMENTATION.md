# Implementation Plan: Observability Stack

**Based on:** `spec/observability-plan.md`
**Status:** Ready for implementation
**Branch:** `feat/observability`

---

## Overview

This plan adds production-grade observability to Easy-Lehrer:
- **OpenTelemetry** for distributed tracing and RED metrics
- **Sentry** for error tracking (client + server + edge)
- **Prometheus** endpoint for metrics scraping
- **Health check** endpoint for container orchestration
- **Grafana stack** for local development monitoring

---

## Current State Analysis

### Existing Infrastructure
- **Framework:** Next.js 16 (App Router, Turbopack, `output: 'standalone'`)
- **Database:** MySQL 8.0 with Prisma ORM
- **i18n:** next-intl with de/en locales
- **Config:** `next.config.ts` uses `withNextIntl` wrapper
- **Error handling:** Basic helpers in `lib/api.ts` (`unauthorized()`, `serverError()`, etc.)
- **Docker:** Multi-stage Dockerfile with `scripts/start.sh` entrypoint

### What's Missing
- No instrumentation hook
- No error boundaries (`app/**/error.tsx` does not exist)
- No health or metrics endpoints
- No centralized error tracking
- No Sentry integration

---

## Implementation Tasks

### Phase 1: Metrics Foundation

#### Task 1.1: Install Dependencies
```bash
npm install @vercel/otel @sentry/nextjs prom-client
```

**Packages:**
- `@vercel/otel` - OpenTelemetry integration for Next.js
- `@sentry/nextjs` - Sentry SDK with Next.js-specific features
- `prom-client` - Prometheus metrics library

#### Task 1.2: Create `lib/metrics.ts`

Create the metrics registry with RED metrics (Request rate, Error rate, Duration).

**File:** `lib/metrics.ts`
```typescript
import client from 'prom-client';

// Create a custom registry to avoid conflicts
const register = new client.Registry();

// Collect default Node.js metrics (CPU, memory, event loop, etc.)
client.collectDefaultMetrics({ register });

// HTTP request counter (R in RED)
export const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

// HTTP request duration histogram (D in RED)
export const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [register],
});

// HTTP request error counter (E in RED)
export const httpRequestErrors = new client.Counter({
  name: 'http_request_errors_total',
  help: 'Total number of HTTP request errors',
  labelNames: ['method', 'route', 'error_type'],
  registers: [register],
});

// Database query duration
export const dbQueryDuration = new client.Histogram({
  name: 'db_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['operation'],
  buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1],
  registers: [register],
});

export { register };
```

#### Task 1.3: Create `app/api/metrics/route.ts`

**File:** `app/api/metrics/route.ts`
```typescript
import { NextResponse } from 'next/server';
import { register } from '@/lib/metrics';

export async function GET() {
  const metrics = await register.metrics();
  return new NextResponse(metrics, {
    headers: { 'Content-Type': register.contentType },
  });
}

export const dynamic = 'force-dynamic';
```

#### Task 1.4: Create `app/api/health/route.ts`

**File:** `app/api/health/route.ts`
```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  const checks: Record<string, { status: string; latencyMs?: number }> = {};
  let overallStatus: 'healthy' | 'unhealthy' = 'healthy';

  // Database check
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    checks.database = { status: 'up', latencyMs: Date.now() - dbStart };
  } catch {
    checks.database = { status: 'down' };
    overallStatus = 'unhealthy';
  }

  const response = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    checks,
  };

  return NextResponse.json(response, {
    status: overallStatus === 'healthy' ? 200 : 503,
  });
}

export const dynamic = 'force-dynamic';
```

#### Task 1.5: Verify Endpoints

After implementation, verify:
```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/api/metrics
```

---

### Phase 2: OpenTelemetry

#### Task 2.1: Create `instrumentation.ts`

**File:** `instrumentation.ts` (project root)
```typescript
import { registerOTel } from '@vercel/otel';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    registerOTel({
      serviceName: process.env.OTEL_SERVICE_NAME || 'easy-lehrer',
    });
  }
}
```

#### Task 2.2: ~~Update `next.config.ts`~~ (SKIPPED)

**Note:** In Next.js 16+, the `instrumentation.ts` file is automatically detected at the project root. The `instrumentationHook` experimental flag is no longer needed and has been removed from the config types.

#### Task 2.3: Verify Instrumentation

Check server logs on startup for instrumentation registration message.

---

### Phase 3: Sentry Integration

#### Task 3.1: Run Sentry Wizard

```bash
npx @sentry/wizard@latest -i nextjs
```

This wizard will:
- Create `sentry.client.config.ts`
- Create `sentry.server.config.ts`
- Create `sentry.edge.config.ts`
- Update `next.config.ts` with `withSentryConfig`
- Add example route for testing

#### Task 3.2: Configure `sentry.client.config.ts`

**File:** `sentry.client.config.ts`
```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Session replay (optional, for debugging UX issues)
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Only enable in production or when DSN is set
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Environment
  environment: process.env.NODE_ENV,

  // Integrations
  integrations: [
    Sentry.replayIntegration(),
  ],
});
```

#### Task 3.3: Configure `sentry.server.config.ts`

**File:** `sentry.server.config.ts`
```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Performance monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Only enable when DSN is set
  enabled: !!process.env.SENTRY_DSN,

  // Environment
  environment: process.env.NODE_ENV,
});
```

#### Task 3.4: Configure `sentry.edge.config.ts`

**File:** `sentry.edge.config.ts`
```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  enabled: !!process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

#### Task 3.5: Update `next.config.ts` with Sentry Wrapper

**File:** `next.config.ts` (final version)
```typescript
import type { NextConfig } from "next";
import { withSentryConfig } from '@sentry/nextjs';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  output: 'standalone',
  turbopack: {},
  experimental: {
    instrumentationHook: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
};

// Wrap with next-intl first, then Sentry
const configWithIntl = withNextIntl(nextConfig);

// Only apply Sentry in production or when configured
export default process.env.SENTRY_DSN
  ? withSentryConfig(configWithIntl, {
      silent: true,
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      hideSourceMaps: true,
      disableLogger: true,
    })
  : configWithIntl;
```

#### Task 3.6: Create Global Error Boundary

**File:** `app/global-error.tsx`
```typescript
'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-base">
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold text-text mb-4">
              Ein Fehler ist aufgetreten
            </h2>
            <p className="text-subtext0 mb-6">
              Bitte versuchen Sie es erneut oder kontaktieren Sie den Support.
            </p>
            <button
              onClick={reset}
              className="px-4 py-2 bg-blue text-white rounded-lg hover:bg-opacity-90"
            >
              Erneut versuchen
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
```

#### Task 3.7: Create Localized Error Boundary

**File:** `app/[locale]/error.tsx`
```typescript
'use client';

import * as Sentry from '@sentry/nextjs';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('error');

  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-text mb-4">
          {t('title')}
        </h2>
        <p className="text-subtext0 mb-6">
          {t('description')}
        </p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-blue text-white rounded-lg hover:bg-opacity-90"
        >
          {t('retry')}
        </button>
      </div>
    </div>
  );
}
```

---

### Phase 4: Error Handling Refactor

#### Task 4.1: Create `lib/api-error.ts`

**File:** `lib/api-error.ts`
```typescript
import * as Sentry from '@sentry/nextjs';
import { NextResponse } from 'next/server';
import { httpRequestErrors } from './metrics';

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function handleApiError(
  error: unknown,
  context: { route: string; method: string }
) {
  // Report to Sentry
  Sentry.withScope((scope) => {
    scope.setTag('route', context.route);
    scope.setTag('method', context.method);
    Sentry.captureException(error);
  });

  // Increment error metric
  httpRequestErrors.inc({
    method: context.method,
    route: context.route,
    error_type: error instanceof ApiError ? 'api_error' : 'unknown_error',
  });

  // Log to console
  console.error(`[${context.method}] ${context.route}:`, error);

  // Return appropriate response
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    );
  }

  return NextResponse.json(
    { error: 'Internal Server Error' },
    { status: 500 }
  );
}
```

#### Task 4.2: Add i18n Error Messages

**Add to `messages/de.json`:**
```json
{
  "error": {
    "title": "Ein Fehler ist aufgetreten",
    "description": "Bitte versuchen Sie es erneut oder kontaktieren Sie den Support.",
    "retry": "Erneut versuchen",
    "notFound": "Seite nicht gefunden",
    "unauthorized": "Nicht autorisiert",
    "serverError": "Serverfehler"
  }
}
```

**Add to `messages/en.json`:**
```json
{
  "error": {
    "title": "An error occurred",
    "description": "Please try again or contact support.",
    "retry": "Try again",
    "notFound": "Page not found",
    "unauthorized": "Unauthorized",
    "serverError": "Server error"
  }
}
```

#### Task 4.3: Migrate API Routes (Optional/Incremental)

Example migration of an API route to use `handleApiError`:

```typescript
// Before
export async function GET(request: NextRequest) {
  try {
    // ... logic
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

// After
import { handleApiError } from '@/lib/api-error';

export async function GET(request: NextRequest) {
  try {
    // ... logic
  } catch (error) {
    return handleApiError(error, { route: '/api/example', method: 'GET' });
  }
}
```

---

### Phase 5: Monitoring Stack

#### Task 5.1: Create Prometheus Config

**File:** `monitoring/prometheus.yml`
```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'easy-lehrer'
    static_configs:
      - targets: ['app:3000']
    metrics_path: '/api/metrics'
    scrape_interval: 10s
```

#### Task 5.2: Create Grafana Provisioning

**File:** `monitoring/grafana/provisioning/datasources/datasources.yml`
```yaml
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: false
```

**File:** `monitoring/grafana/provisioning/dashboards/dashboards.yml`
```yaml
apiVersion: 1

providers:
  - name: 'default'
    orgId: 1
    folder: ''
    type: file
    disableDeletion: false
    editable: true
    options:
      path: /etc/grafana/provisioning/dashboards
```

#### Task 5.3: Create Docker Compose for Monitoring

**File:** `docker-compose.monitoring.yml`
```yaml
services:
  prometheus:
    image: prom/prometheus:v2.50.0
    container_name: easy-lehrer-prometheus
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prometheus_data:/prometheus
    ports:
      - "9090:9090"
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.enable-lifecycle'
    networks:
      - default

  grafana:
    image: grafana/grafana:10.3.0
    container_name: easy-lehrer-grafana
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=admin
      - GF_USERS_ALLOW_SIGN_UP=false
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/grafana/provisioning:/etc/grafana/provisioning:ro
    ports:
      - "3001:3000"
    depends_on:
      - prometheus
    networks:
      - default

volumes:
  prometheus_data:
  grafana_data:
```

#### Task 5.4: Update Dockerfile

Add instrumentation.ts to standalone build. In `Dockerfile`, add after copying standalone files:

```dockerfile
# Copy instrumentation file for OpenTelemetry
COPY --from=builder /app/instrumentation.ts ./instrumentation.ts
```

#### Task 5.5: Update `.env.example`

Add to `.env.example`:

```bash
# ===========================================
# Observability Configuration
# ===========================================

# Sentry (error tracking)
SENTRY_DSN=""
NEXT_PUBLIC_SENTRY_DSN=""
SENTRY_ORG=""
SENTRY_PROJECT=""
SENTRY_AUTH_TOKEN=""

# OpenTelemetry
OTEL_SERVICE_NAME="easy-lehrer"
```

---

## File Checklist

### New Files to Create
- [x] `lib/metrics.ts` - Prometheus metrics registry
- [x] `lib/api-error.ts` - Centralized API error handling
- [x] `app/api/health/route.ts` - Health check endpoint
- [x] `app/api/metrics/route.ts` - Prometheus scrape endpoint
- [x] `app/global-error.tsx` - Root error boundary
- [x] `app/[locale]/error.tsx` - Localized error boundary
- [x] `instrumentation.ts` - OpenTelemetry registration
- [x] `sentry.client.config.ts` - Client Sentry config
- [x] `sentry.server.config.ts` - Server Sentry config
- [x] `sentry.edge.config.ts` - Edge Sentry config
- [x] `monitoring/prometheus.yml` - Prometheus config
- [x] `monitoring/grafana/provisioning/datasources/datasources.yml`
- [x] `monitoring/grafana/provisioning/dashboards/dashboards.yml`
- [x] `docker-compose.monitoring.yml` - Monitoring stack

### Files to Modify
- [x] `next.config.ts` - Wrap with Sentry (Note: `instrumentationHook` not needed in Next.js 16+, instrumentation.ts is auto-detected)
- [x] `Dockerfile` - Copy instrumentation.ts
- [x] `.env.example` - Add Sentry/OTEL vars
- [x] `messages/de.json` - Add error translations
- [x] `messages/en.json` - Add error translations

---

## Verification Steps

### 1. Health Endpoint
```bash
curl http://localhost:3000/api/health
# Expected: {"status":"healthy","timestamp":"...","checks":{"database":{"status":"up","latencyMs":...}}}
```

### 2. Metrics Endpoint
```bash
curl http://localhost:3000/api/metrics
# Expected: Prometheus format metrics output
```

### 3. Sentry Test
```bash
# Trigger test error in browser console or create test endpoint
# Verify error appears in Sentry dashboard
```

### 4. Monitoring Stack
```bash
docker compose -f docker-compose.yml -f docker-compose.monitoring.yml up
# Prometheus: http://localhost:9090
# Grafana: http://localhost:3001 (admin/admin)
```

---

## Production Considerations

1. **Sentry sampling:** Set `tracesSampleRate: 0.1` (10%) in production
2. **Metrics security:** Add `/api/metrics` to rate limiting or IP whitelist
3. **Health check:** Configure Dokploy to use `/api/health` for container health
4. **Environment variables:** Set all Sentry vars in Dokploy service settings
5. **Source maps:** Source maps are hidden by default (`hideSourceMaps: true`)

---

## Rollback Plan

If issues arise:
1. Remove `withSentryConfig` wrapper from `next.config.ts`
2. Remove `instrumentationHook: true` from experimental config
3. Dependencies can remain installed (unused code is tree-shaken)
4. Error boundaries are safe to leave in place (just won't report to Sentry)

---

## API Routes to Migrate (45 total)

The following API routes use the current error handling pattern and can be incrementally migrated to use `handleApiError`:

| Route | Priority |
|-------|----------|
| `app/api/resources/route.ts` | High |
| `app/api/resources/[id]/route.ts` | High |
| `app/api/resources/[id]/download/route.ts` | High |
| `app/api/payments/webhook/route.ts` | High |
| `app/api/payments/create-checkout-session/route.ts` | High |
| `app/api/auth/register/route.ts` | Medium |
| `app/api/seller/connect/route.ts` | Medium |
| `app/api/upload/route.ts` | Medium |
| `app/api/admin/*` | Low |
| `app/api/user/*` | Low |
| `app/api/collections/*` | Low |

Migration can be done incrementally as routes are touched for other changes.
