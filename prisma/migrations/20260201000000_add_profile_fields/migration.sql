-- Add new profile fields to User table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "website" VARCHAR(255);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "school" VARCHAR(150);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "teaching_experience" VARCHAR(20);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "preferred_language" VARCHAR(5) NOT NULL DEFAULT 'de';
