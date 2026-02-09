-- CreateEnum
CREATE TYPE "Dialect" AS ENUM ('STANDARD', 'SWISS', 'BOTH');

-- AlterTable: Add seller reward level fields to users
ALTER TABLE "users" ADD COLUMN     "seller_level" SMALLINT NOT NULL DEFAULT 0,
ADD COLUMN     "seller_xp" INTEGER NOT NULL DEFAULT 0;

-- AlterTable: Add verified seller fields to users
ALTER TABLE "users" ADD COLUMN     "is_verified_seller" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "verified_seller_at" TIMESTAMP(3),
ADD COLUMN     "verified_seller_method" VARCHAR(50);

-- AlterTable: Add dialect field to resources
ALTER TABLE "resources" ADD COLUMN     "dialect" "Dialect" NOT NULL DEFAULT 'BOTH';

