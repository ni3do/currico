-- Teacher Verification Fields
-- Auto-verify teachers via Swiss school email domains

-- Add teacher verification fields to users table
ALTER TABLE "users" ADD COLUMN "is_teacher_verified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN "teacher_verified_at" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN "teacher_verification_method" VARCHAR(50);

-- Add index for querying verified teachers
CREATE INDEX "users_is_teacher_verified_idx" ON "users"("is_teacher_verified") WHERE "is_teacher_verified" = true;
