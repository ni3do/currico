-- Enable pg_trgm extension for fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Add trigram indexes for fuzzy search on resources
CREATE INDEX IF NOT EXISTS idx_resources_title_trgm ON resources USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_resources_description_trgm ON resources USING gin (description gin_trgm_ops);

-- Create password_reset_tokens table
CREATE TABLE IF NOT EXISTS "password_reset_tokens" (
    "id" VARCHAR(50) NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" VARCHAR(50) NOT NULL,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "password_reset_tokens_token_key" ON "password_reset_tokens"("token");
CREATE INDEX IF NOT EXISTS "password_reset_tokens_user_id_idx" ON "password_reset_tokens"("user_id");

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Drop trigger that depends on resources.title before altering column type
DROP TRIGGER IF EXISTS resources_search_vector_trigger ON "resources";

-- Update column constraints
ALTER TABLE "resources" ALTER COLUMN "title" TYPE VARCHAR(64);
ALTER TABLE "users" ALTER COLUMN "display_name" TYPE VARCHAR(32);

-- Recreate the search vector trigger after column alteration
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

-- Create NotificationType enum
DO $$ BEGIN
    CREATE TYPE "NotificationType" AS ENUM ('SALE', 'FOLLOW', 'REVIEW', 'SYSTEM');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create notifications table
CREATE TABLE IF NOT EXISTS "notifications" (
    "id" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read_at" TIMESTAMP(3),
    "type" "NotificationType" NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "body" TEXT,
    "link" VARCHAR(500),
    "user_id" VARCHAR(50) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "notifications_user_id_read_at_idx" ON "notifications"("user_id", "read_at");
CREATE INDEX IF NOT EXISTS "notifications_created_at_idx" ON "notifications"("created_at");

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
