# Development Environment Variables

This document lists environment variables for local development of Currico.

## Quick Start

```bash
cp .env.example .env
docker compose up
```

This starts the app at `http://localhost:3000` with a MySQL database.

---

## Required Variables

### Database

| Variable              | Description                          | Default                               |
| --------------------- | ------------------------------------ | ------------------------------------- |
| `DATABASE_URL`        | MySQL connection string              | `mysql://mysql:mysql@db:3306/currico` |
| `MYSQL_ROOT_PASSWORD` | MySQL root password (docker-compose) | `rootpassword`                        |
| `MYSQL_DATABASE`      | Database name                        | `currico`                             |
| `MYSQL_USER`          | Database user                        | `mysql`                               |
| `MYSQL_PASSWORD`      | Database password                    | `mysql`                               |

**Note:** Use `db` as hostname when running with Docker Compose, or `localhost` when running MySQL separately.

### Authentication

| Variable      | Description         | Default                                 |
| ------------- | ------------------- | --------------------------------------- |
| `AUTH_SECRET` | NextAuth secret key | Generate with `openssl rand -base64 32` |
| `AUTH_URL`    | Application URL     | `http://localhost:3000`                 |

---

## Optional Variables

### Port Configuration

| Variable   | Description                  | Default |
| ---------- | ---------------------------- | ------- |
| `APP_PORT` | Application port             | `3000`  |
| `DB_PORT`  | MySQL port (exposed to host) | `3306`  |

### Storage

For local development, files are stored in `public/uploads/`.

| Variable           | Description     | Default |
| ------------------ | --------------- | ------- |
| `STORAGE_PROVIDER` | Storage backend | `local` |

To test S3 integration locally, set `STORAGE_PROVIDER=s3` and configure the S3 variables (see [PRODUCTION_ENV.md](./PRODUCTION_ENV.md)).

### Email

Emails are logged to console in development. To test actual email sending:

| Variable         | Description                                  |
| ---------------- | -------------------------------------------- |
| `RESEND_API_KEY` | Resend API key (get free tier at resend.com) |
| `EMAIL_FROM`     | Sender address (default: `info@currico.ch`)  |
| `ADMIN_EMAIL`    | Admin notification email                     |

### Stripe (Test Mode)

Use Stripe test keys for development:

| Variable                             | Description                          |
| ------------------------------------ | ------------------------------------ |
| `STRIPE_SECRET_KEY`                  | Test secret key (`sk_test_...`)      |
| `STRIPE_WEBHOOK_SECRET`              | Webhook secret for local testing     |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Test publishable key (`pk_test_...`) |

**Testing webhooks locally:**

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### OAuth Providers (Optional)

#### Google

| Variable               | Description         |
| ---------------------- | ------------------- |
| `GOOGLE_CLIENT_ID`     | OAuth client ID     |
| `GOOGLE_CLIENT_SECRET` | OAuth client secret |

Set authorized redirect URI to: `http://localhost:3000/api/auth/callback/google`

#### Microsoft

| Variable                  | Description           |
| ------------------------- | --------------------- |
| `MICROSOFT_CLIENT_ID`     | OAuth client ID       |
| `MICROSOFT_CLIENT_SECRET` | OAuth client secret   |
| `MICROSOFT_TENANT_ID`     | Tenant ID or `common` |

Set authorized redirect URI to: `http://localhost:3000/api/auth/callback/microsoft`

#### Switch edu-ID

| Variable              | Description                 |
| --------------------- | --------------------------- |
| `EDUID_CLIENT_ID`     | Client ID from Switch AAI   |
| `EDUID_CLIENT_SECRET` | Client secret               |
| `EDUID_USE_TEST`      | `true` for test environment |

Register at https://rr.aai.switch.ch/ for test credentials.

---

## Minimal .env for Development

The bare minimum to get started:

```env
# Database (works with docker-compose defaults)
DATABASE_URL="mysql://mysql:mysql@db:3306/currico"
MYSQL_ROOT_PASSWORD=rootpassword
MYSQL_DATABASE=currico
MYSQL_USER=mysql
MYSQL_PASSWORD=mysql

# Auth (generate your own secret)
AUTH_SECRET="your-generated-secret-here"
AUTH_URL="http://localhost:3000"

# Storage (local filesystem)
STORAGE_PROVIDER="local"
```

---

## Full Development .env

```env
# ===========================================
# Database Configuration
# ===========================================
DATABASE_URL="mysql://mysql:mysql@db:3306/currico"
MYSQL_ROOT_PASSWORD=rootpassword
MYSQL_DATABASE=currico
MYSQL_USER=mysql
MYSQL_PASSWORD=mysql

# ===========================================
# Port Configuration
# ===========================================
APP_PORT=3000
DB_PORT=3306

# ===========================================
# Authentication
# ===========================================
AUTH_SECRET="generate-with-openssl-rand-base64-32"
AUTH_URL="http://localhost:3000"

# ===========================================
# Storage (local for development)
# ===========================================
STORAGE_PROVIDER="local"

# ===========================================
# Email (optional - logs to console if not set)
# ===========================================
RESEND_API_KEY=""
EMAIL_FROM="info@currico.ch"
ADMIN_EMAIL="info@currico.ch"

# ===========================================
# Stripe Test Mode (optional)
# ===========================================
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# ===========================================
# OAuth Providers (optional)
# ===========================================
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
MICROSOFT_CLIENT_ID=""
MICROSOFT_CLIENT_SECRET=""
MICROSOFT_TENANT_ID=""
EDUID_CLIENT_ID=""
EDUID_CLIENT_SECRET=""
EDUID_USE_TEST="true"
```

---

## Common Issues

### Database connection refused

If using Docker Compose, ensure you're using `db` as the hostname:

```env
DATABASE_URL="mysql://mysql:mysql@db:3306/currico"
```

If running MySQL locally (not in Docker):

```env
DATABASE_URL="mysql://mysql:mysql@localhost:3306/currico"
```

### Prisma client not generated

Run after pulling new changes:

```bash
npx prisma generate
```

### Database schema out of sync

Push schema changes to database:

```bash
npx prisma db push
```

### Port already in use

Change the port in `.env`:

```env
APP_PORT=3001
```

Or kill the process using port 3000:

```bash
lsof -ti:3000 | xargs kill -9
```

---

## Testing S3 Locally

To test the S3 integration without Infomaniak:

1. Use [MinIO](https://min.io/) as a local S3-compatible server:

   ```bash
   docker run -p 9000:9000 -p 9001:9001 \
     -e MINIO_ROOT_USER=minioadmin \
     -e MINIO_ROOT_PASSWORD=minioadmin \
     minio/minio server /data --console-address ":9001"
   ```

2. Create buckets via MinIO console at `http://localhost:9001`

3. Configure environment:
   ```env
   STORAGE_PROVIDER="s3"
   S3_ENDPOINT="http://localhost:9000"
   S3_REGION="us-east-1"
   S3_ACCESS_KEY_ID="minioadmin"
   S3_SECRET_ACCESS_KEY="minioadmin"
   S3_PUBLIC_BUCKET="currico-public"
   S3_PRIVATE_BUCKET="currico-private"
   S3_PUBLIC_BUCKET_URL="http://localhost:9000/currico-public"
   NEXT_PUBLIC_STORAGE_PUBLIC_URL="http://localhost:9000/currico-public"
   ```
