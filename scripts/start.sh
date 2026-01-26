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
echo "Prisma version: $(./node_modules/.bin/prisma --version)"
./node_modules/.bin/prisma migrate deploy

# Seed database unless SKIP_SEED is set to "true"
if [ "$SKIP_SEED" != "true" ]; then
  echo "Seeding database..."
  ./node_modules/.bin/tsx prisma/seed.ts || echo "Seeding completed (or already seeded)"
else
  echo "Skipping database seed (SKIP_SEED=true)"
fi

echo "Starting application..."
exec node server.js
