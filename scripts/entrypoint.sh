#!/bin/sh
set -e

# Fix permissions on mounted volumes (runs as root)
# This handles Docker volumes that may be mounted with root ownership
if [ -d "/app/public/uploads" ]; then
  echo "Fixing permissions on /app/public/uploads..."
  chown -R nextjs:nodejs /app/public/uploads
  chmod -R 755 /app/public/uploads
else
  echo "Creating /app/public/uploads directory..."
  mkdir -p /app/public/uploads
  chown -R nextjs:nodejs /app/public/uploads
  chmod -R 755 /app/public/uploads
fi

# Run database migrations as root (Prisma needs write access to engines dir)
if [ -n "$DATABASE_URL" ]; then
  echo "Running database migrations..."
  npx prisma migrate deploy
fi

# Drop privileges and run the command as nextjs user
echo "Switching to nextjs user..."
exec su-exec nextjs "$@"
