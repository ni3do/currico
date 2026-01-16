# Implementation Plan: OpenTelemetry + Sentry for Easy-Lehrer

## Overview

Add production-grade observability with:
- **OpenTelemetry** for RED metrics (Request rate, Error rate, Duration)
- **Sentry** for error tracking (server + client)
- **Prometheus endpoint** for metrics scraping
- **Health check endpoint** for container orchestration
- **Grafana stack** for local development monitoring

## Dependencies to Install

```bash
npm install @vercel/otel @sentry/nextjs prom-client
```

## Files to Create

| File | Purpose |
|------|---------|
| `instrumentation.ts` | OpenTelemetry registration (project root) |
| `lib/metrics.ts` | Prometheus metrics registry + RED metrics |
| `lib/api-error.ts` | Centralized API error handling with Sentry |
| `app/api/health/route.ts` | Health check endpoint |
| `app/api/metrics/route.ts` | Prometheus scrape endpoint |
| `app/global-error.tsx` | Root error boundary with Sentry |
| `app/[locale]/error.tsx` | Localized error boundary |
| `sentry.client.config.ts` | Client-side Sentry config |
| `sentry.server.config.ts` | Server-side Sentry config |
| `sentry.edge.config.ts` | Edge runtime Sentry config |
| `monitoring/prometheus.yml` | Prometheus scrape config |
| `monitoring/grafana/...` | Grafana provisioning files |
| `docker-compose.monitoring.yml` | Prometheus + Grafana services |

## Files to Modify

| File | Changes |
|------|---------|
| `next.config.ts` | Add `instrumentationHook: true`, wrap with `withSentryConfig` |
| `.env.example` | Add Sentry DSN, OTEL vars |
| `messages/de.json` | Add error translations |
| `messages/en.json` | Add error translations |
| `Dockerfile` | Copy instrumentation.ts to standalone build |

## Implementation Order

### Phase 1: Metrics Foundation
1. Install dependencies
2. Create `lib/metrics.ts` with RED metrics
3. Create `app/api/metrics/route.ts`
4. Create `app/api/health/route.ts`
5. Test endpoints work

### Phase 2: OpenTelemetry
6. Create `instrumentation.ts` at project root
7. Update `next.config.ts` with `instrumentationHook: true`
8. Verify instrumentation loads on startup

### Phase 3: Sentry Integration
9. Run `npx @sentry/wizard@latest -i nextjs`
10. Configure `sentry.client.config.ts`
11. Configure `sentry.server.config.ts`
12. Configure `sentry.edge.config.ts`
13. Update `next.config.ts` with `withSentryConfig` wrapper
14. Create error boundary components

### Phase 4: Error Handling Refactor
15. Create `lib/api-error.ts`
16. Add i18n error messages
17. Update API routes to use `handleApiError()` (can be incremental)

### Phase 5: Docker/Monitoring Stack
18. Create `monitoring/` directory with Prometheus + Grafana configs
19. Create `docker-compose.monitoring.yml`
20. Update `Dockerfile` for instrumentation
21. Update `.env.example`

## Environment Variables

```bash
# Sentry
SENTRY_DSN="https://xxx@sentry.io/xxx"
NEXT_PUBLIC_SENTRY_DSN="https://xxx@sentry.io/xxx"
SENTRY_ORG="your-org"
SENTRY_PROJECT="easy-lehrer"
SENTRY_AUTH_TOKEN="sntrys_xxx"

# OpenTelemetry
OTEL_SERVICE_NAME="easy-lehrer"
```

## Key Code Snippets

### instrumentation.ts
```typescript
import { registerOTel } from '@vercel/otel';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    registerOTel({ serviceName: 'easy-lehrer' });
  }
}
```

### lib/metrics.ts
```typescript
import client from 'prom-client';

const register = new client.Registry();
client.collectDefaultMetrics({ register });

export const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

export const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [register],
});

export const httpRequestErrors = new client.Counter({
  name: 'http_request_errors_total',
  help: 'Total number of HTTP request errors',
  labelNames: ['method', 'route', 'error_type'],
  registers: [register],
});

export { register };
```

### app/api/health/route.ts
```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: { status: 'up', latencyMs: Date.now() - dbStart },
    });
  } catch (error) {
    return NextResponse.json(
      { status: 'unhealthy', database: { status: 'down' } },
      { status: 503 }
    );
  }
}

export const dynamic = 'force-dynamic';
```

### app/api/metrics/route.ts
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

### next.config.ts (final structure)
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

export default withSentryConfig(withNextIntl(nextConfig), {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  hideSourceMaps: true,
  disableLogger: true,
});
```

### lib/api-error.ts
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
  Sentry.withScope((scope) => {
    scope.setTag('route', context.route);
    scope.setTag('method', context.method);
    Sentry.captureException(error);
  });

  httpRequestErrors.inc({
    method: context.method,
    route: context.route,
    error_type: error instanceof ApiError ? 'api_error' : 'unknown_error',
  });

  console.error(`[${context.method}] ${context.route}:`, error);

  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    );
  }

  return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
}
```

### app/global-error.tsx
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

### docker-compose.monitoring.yml
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
    depends_on:
      - app
    networks:
      - default

  grafana:
    image: grafana/grafana:10.3.0
    container_name: easy-lehrer-grafana
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=admin
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

### monitoring/prometheus.yml
```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'easy-lehrer'
    static_configs:
      - targets: ['app:3000']
    metrics_path: '/api/metrics'
    scrape_interval: 10s
```

## Verification

1. **Health endpoint**: `curl http://localhost:3000/api/health`
2. **Metrics endpoint**: `curl http://localhost:3000/api/metrics`
3. **Sentry test**: Trigger an error, verify it appears in Sentry dashboard
4. **Grafana**: Run monitoring stack and access at `localhost:3001`

```bash
docker compose -f docker-compose.yml -f docker-compose.monitoring.yml up
```

## Production Notes

- Set `tracesSampleRate: 0.1` in production (10% sampling)
- Add `/api/metrics` to rate limiting or IP whitelist
- Configure Dokploy health check to use `/api/health`
- Set Sentry environment variables in Dokploy service settings
