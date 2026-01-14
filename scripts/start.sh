#!/bin/sh
set -e

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
