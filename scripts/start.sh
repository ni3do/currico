#!/bin/sh
set -e

# Check for required environment variables
if [ -z "$APP_ENV" ]; then
  echo "ERROR: APP_ENV environment variable is not set"
  echo "Please set APP_ENV to 'production' or 'development'"
  exit 1
fi

if [ "$APP_ENV" != "production" ] && [ "$APP_ENV" != "development" ]; then
  echo "ERROR: APP_ENV must be 'production' or 'development', got: $APP_ENV"
  exit 1
fi

echo "Environment: $APP_ENV"

if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL environment variable is not set"
  echo "Please configure DATABASE_URL in your Dokploy service settings"
  exit 1
fi

echo "Running database migrations..."
npx prisma migrate deploy

# Bootstrap admin user if credentials are provided
if [ -n "$ADMIN_EMAIL" ] && [ -n "$ADMIN_PASSWORD" ]; then
  echo "Bootstrapping admin user..."
  npx tsx prisma/bootstrap-admin.ts
fi

# Seed database only in development (unless SKIP_SEED is set)
if [ "$APP_ENV" = "development" ] && [ "$SKIP_SEED" != "true" ]; then
  echo "Seeding database with development data..."
  npx tsx prisma/seed.ts || echo "Seeding completed (or already seeded)"
fi

echo "Starting application..."
exec node server.js
