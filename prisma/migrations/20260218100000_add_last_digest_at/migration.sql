-- AlterTable
ALTER TABLE "users" ADD COLUMN "last_digest_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "newsletter_subscribers" ADD COLUMN "last_digest_at" TIMESTAMP(3);
