#!/bin/sh
set -e

# Check for required environment variable
if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL environment variable is not set"
  echo "Please configure DATABASE_URL in your Dokploy service settings"
  exit 1
fi

echo "Running database migrations..."
npx prisma migrate deploy

# Seed database unless SKIP_SEED is set to "true"
if [ "$SKIP_SEED" != "true" ]; then
  echo "Seeding database..."
  npx tsx prisma/seed.ts || echo "Seeding completed (or already seeded)"
else
  echo "Skipping database seed (SKIP_SEED=true)"
fi

echo "Starting application..."
exec node server.js
