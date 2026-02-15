#!/bin/sh
set -e

# Wait for Postgres TCP port — lightweight check (no Prisma engine needed).
# docker-compose depends_on:service_healthy covers most cases, but this
# handles the rare race where healthcheck passes before TCP is routable.
DB_HOST="${DB_HOST:-db}"
DB_PORT="${DB_PORT:-5432}"
echo "==> Waiting for database at ${DB_HOST}:${DB_PORT}..."
for i in $(seq 1 15); do
  if nc -z "$DB_HOST" "$DB_PORT" 2>/dev/null; then
    echo "==> Database is ready."
    break
  fi
  if [ "$i" = 15 ]; then
    echo "==> ERROR: Database not reachable after 30s, continuing anyway..."
  fi
  sleep 2
done

PRISMA_EXEC="npx prisma db execute --stdin --schema prisma/schema.prisma"

echo "==> Enabling required PostgreSQL extensions..."
$PRISMA_EXEC <<'SQL' || true
CREATE EXTENSION IF NOT EXISTS pg_trgm;
SQL

echo "==> Dropping search trigger before schema push..."
$PRISMA_EXEC <<'SQL' || true
DROP TRIGGER IF EXISTS resources_search_vector_trigger ON "resources";
SQL

echo "==> Pushing Prisma schema..."
npx prisma db push --accept-data-loss

echo "==> Recreating search trigger..."
$PRISMA_EXEC <<'SQL' || true
CREATE OR REPLACE FUNCTION resources_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := (
    setweight(to_tsvector('german', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('german', COALESCE(NEW.description, '')), 'B')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER resources_search_vector_trigger
  BEFORE INSERT OR UPDATE OF title, description
  ON "resources"
  FOR EACH ROW
  EXECUTE FUNCTION resources_search_vector_update();
SQL

echo "==> Seeding database..."
npx prisma db seed

echo "==> Starting dev server..."
exec npm run dev
