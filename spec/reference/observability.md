# Observability Stack

Production-grade observability for Currico, combining OpenTelemetry, Sentry, Prometheus, and Grafana.

## Components

| Component         | Purpose                                          | Status      |
| ----------------- | ------------------------------------------------ | ----------- |
| **Prometheus**    | RED metrics (Request rate, Error rate, Duration) | Implemented |
| **Sentry**        | Error tracking (client + server + edge)          | Implemented |
| **OpenTelemetry** | Distributed tracing                              | Implemented |
| **Health check**  | Container orchestration readiness                | Implemented |
| **Grafana**       | Local development monitoring dashboards          | Implemented |

## Architecture

### Key Files

| File                            | Purpose                                    |
| ------------------------------- | ------------------------------------------ |
| `instrumentation.ts`            | OpenTelemetry registration (project root)  |
| `lib/metrics.ts`                | Prometheus metrics registry + RED metrics  |
| `lib/api-error.ts`              | Centralized API error handling with Sentry |
| `app/api/health/route.ts`       | Health check endpoint                      |
| `app/api/metrics/route.ts`      | Prometheus scrape endpoint                 |
| `app/global-error.tsx`          | Root error boundary with Sentry            |
| `app/[locale]/error.tsx`        | Localized error boundary                   |
| `sentry.client.config.ts`       | Client-side Sentry config                  |
| `sentry.server.config.ts`       | Server-side Sentry config                  |
| `sentry.edge.config.ts`         | Edge runtime Sentry config                 |
| `monitoring/prometheus.yml`     | Prometheus scrape config                   |
| `monitoring/grafana/...`        | Grafana provisioning files                 |
| `docker-compose.monitoring.yml` | Prometheus + Grafana services              |

### Metrics (RED Pattern)

```typescript
// lib/metrics.ts
httpRequestsTotal; // Counter: total HTTP requests (R)
httpRequestErrors; // Counter: total HTTP errors (E)
httpRequestDuration; // Histogram: request duration in seconds (D)
dbQueryDuration; // Histogram: database query duration
```

Default Node.js metrics (CPU, memory, event loop) are also collected.

### Error Handling

`lib/api-error.ts` provides centralized error handling that:

1. Reports to Sentry with route/method tags
2. Increments Prometheus error counters
3. Logs to console
4. Returns appropriate JSON responses

API routes can be incrementally migrated:

```typescript
import { handleApiError } from "@/lib/api-error";

export async function GET(request: NextRequest) {
  try {
    // ... logic
  } catch (error) {
    return handleApiError(error, { route: "/api/example", method: "GET" });
  }
}
```

## Environment Variables

```bash
# Sentry
SENTRY_DSN="https://xxx@sentry.io/xxx"
NEXT_PUBLIC_SENTRY_DSN="https://xxx@sentry.io/xxx"
SENTRY_ORG="your-org"
SENTRY_PROJECT="currico"
SENTRY_AUTH_TOKEN="sntrys_xxx"

# OpenTelemetry
OTEL_SERVICE_NAME="currico"
```

## Endpoints

```bash
# Health check
curl http://localhost:3000/api/health
# → {"status":"healthy","timestamp":"...","checks":{"database":{"status":"up","latencyMs":...}}}

# Prometheus metrics
curl http://localhost:3000/api/metrics
# → Prometheus text format output
```

## Local Monitoring Stack

```bash
docker compose -f docker-compose.yml -f docker-compose.monitoring.yml up
# Prometheus: http://localhost:9090
# Grafana: http://localhost:3001 (admin/admin)
```

## Production Considerations

1. **Sentry sampling:** `tracesSampleRate: 0.1` (10%) in production
2. **Metrics security:** Add `/api/metrics` to rate limiting or IP whitelist
3. **Health check:** Configure Dokploy to use `/api/health` for container health
4. **Environment variables:** Set all Sentry vars in Dokploy service settings
5. **Source maps:** Hidden by default (`hideSourceMaps: true`)

## Next.js Config

In Next.js 16+, `instrumentation.ts` is automatically detected at the project root — no `instrumentationHook` experimental flag needed. Sentry wraps the config conditionally:

```typescript
export default process.env.SENTRY_DSN
  ? withSentryConfig(configWithIntl, { ... })
  : configWithIntl;
```

## API Routes Migration Status

High-priority routes for `handleApiError` migration:

| Route                                               | Priority |
| --------------------------------------------------- | -------- |
| `app/api/resources/route.ts`                        | High     |
| `app/api/resources/[id]/route.ts`                   | High     |
| `app/api/resources/[id]/download/route.ts`          | High     |
| `app/api/payments/webhook/route.ts`                 | High     |
| `app/api/payments/create-checkout-session/route.ts` | High     |
| `app/api/auth/register/route.ts`                    | Medium   |
| `app/api/seller/connect/route.ts`                   | Medium   |
| `app/api/upload/route.ts`                           | Medium   |
| `app/api/admin/*`                                   | Low      |
| `app/api/user/*`                                    | Low      |
| `app/api/collections/*`                             | Low      |

Migration can be done incrementally as routes are touched for other changes.
