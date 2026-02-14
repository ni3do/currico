-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'COMMENT';

-- AlterTable
ALTER TABLE "users" ADD COLUMN "notify_comments" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "users" ADD COLUMN "notify_new_followers" BOOLEAN NOT NULL DEFAULT true;
