-- ============================================================
-- Comprehensive schema sync migration
-- This migration syncs the database schema with the current Prisma schema
-- It handles cases where the DB was modified via db:push without migrations
-- Uses IF NOT EXISTS / IF EXISTS to be idempotent
-- ============================================================

-- ============================================================
-- Add ResourceStatus enum if it doesn't exist
-- ============================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ResourceStatus') THEN
        CREATE TYPE "ResourceStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');
    END IF;
END $$;

-- ============================================================
-- Sync Resource model - add missing columns
-- ============================================================
ALTER TABLE "resources" ADD COLUMN IF NOT EXISTS "status" "ResourceStatus" NOT NULL DEFAULT 'PENDING';
ALTER TABLE "resources" ADD COLUMN IF NOT EXISTS "is_public" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "resources" ADD COLUMN IF NOT EXISTS "eszett_checked" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "resources" ADD COLUMN IF NOT EXISTS "swiss_verified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "resources" ADD COLUMN IF NOT EXISTS "language" TEXT NOT NULL DEFAULT 'de';
ALTER TABLE "resources" ADD COLUMN IF NOT EXISTS "is_mi_integrated" BOOLEAN NOT NULL DEFAULT false;

-- ============================================================
-- Sync User model - add new columns
-- ============================================================
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_protected" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "stripe_customer_id" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "stripe_account_id" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "stripe_onboarding_complete" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "stripe_charges_enabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "stripe_payouts_enabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "seller_terms_accepted_at" TIMESTAMP(3);

-- Sync User model - drop old columns (moved to Stripe KYC)
ALTER TABLE "users" DROP COLUMN IF EXISTS "legal_first_name";
ALTER TABLE "users" DROP COLUMN IF EXISTS "legal_last_name";
ALTER TABLE "users" DROP COLUMN IF EXISTS "iban";
ALTER TABLE "users" DROP COLUMN IF EXISTS "address_street";
ALTER TABLE "users" DROP COLUMN IF EXISTS "address_city";
ALTER TABLE "users" DROP COLUMN IF EXISTS "address_postal";
ALTER TABLE "users" DROP COLUMN IF EXISTS "address_country";
ALTER TABLE "users" DROP COLUMN IF EXISTS "is_seller";
ALTER TABLE "users" DROP COLUMN IF EXISTS "seller_verified";
ALTER TABLE "users" DROP COLUMN IF EXISTS "payout_enabled";

-- ============================================================
-- Sync Transaction model - add missing columns
-- ============================================================
ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "stripe_payment_intent_id" TEXT;
ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "stripe_checkout_session_id" TEXT;
ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "payment_method" TEXT;
ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "invoice_number" TEXT;
ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "invoice_pdf_url" TEXT;
ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "platform_fee_amount" INTEGER;
ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "seller_payout_amount" INTEGER;
ALTER TABLE "transactions" ADD COLUMN IF NOT EXISTS "guest_email" TEXT;

-- Make buyer_id nullable for guest checkout
ALTER TABLE "transactions" ALTER COLUMN "buyer_id" DROP NOT NULL;

-- Add unique constraint on stripe_payment_intent_id if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'transactions_stripe_payment_intent_id_key') THEN
        CREATE UNIQUE INDEX "transactions_stripe_payment_intent_id_key" ON "transactions"("stripe_payment_intent_id");
    END IF;
END $$;

-- Add unique constraint on invoice_number if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'transactions_invoice_number_key') THEN
        CREATE UNIQUE INDEX "transactions_invoice_number_key" ON "transactions"("invoice_number");
    END IF;
END $$;

-- ============================================================
-- Create downloads table if not exists
-- ============================================================
CREATE TABLE IF NOT EXISTS "downloads" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,
    "resource_id" TEXT NOT NULL,

    CONSTRAINT "downloads_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "downloads_user_id_resource_id_key" ON "downloads"("user_id", "resource_id");

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'downloads_user_id_fkey') THEN
        ALTER TABLE "downloads" ADD CONSTRAINT "downloads_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'downloads_resource_id_fkey') THEN
        ALTER TABLE "downloads" ADD CONSTRAINT "downloads_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- ============================================================
-- Create download_tokens table if not exists
-- ============================================================
CREATE TABLE IF NOT EXISTS "download_tokens" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "download_count" INTEGER NOT NULL DEFAULT 0,
    "max_downloads" INTEGER NOT NULL DEFAULT 3,
    "transaction_id" TEXT NOT NULL,

    CONSTRAINT "download_tokens_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "download_tokens_token_key" ON "download_tokens"("token");

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'download_tokens_transaction_id_fkey') THEN
        ALTER TABLE "download_tokens" ADD CONSTRAINT "download_tokens_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- ============================================================
-- Create wishlists table if not exists
-- ============================================================
CREATE TABLE IF NOT EXISTS "wishlists" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,
    "resource_id" TEXT NOT NULL,

    CONSTRAINT "wishlists_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "wishlists_user_id_resource_id_key" ON "wishlists"("user_id", "resource_id");

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'wishlists_user_id_fkey') THEN
        ALTER TABLE "wishlists" ADD CONSTRAINT "wishlists_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'wishlists_resource_id_fkey') THEN
        ALTER TABLE "wishlists" ADD CONSTRAINT "wishlists_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- ============================================================
-- Create bundles table if not exists
-- ============================================================
CREATE TABLE IF NOT EXISTS "bundles" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "price" INTEGER NOT NULL,
    "subject" TEXT[],
    "cycle" TEXT[],
    "cover_image_url" TEXT,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "status" "ResourceStatus" NOT NULL DEFAULT 'PENDING',
    "seller_id" TEXT NOT NULL,

    CONSTRAINT "bundles_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'bundles_seller_id_fkey') THEN
        ALTER TABLE "bundles" ADD CONSTRAINT "bundles_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- ============================================================
-- Create bundle_resources table if not exists
-- ============================================================
CREATE TABLE IF NOT EXISTS "bundle_resources" (
    "bundle_id" TEXT NOT NULL,
    "resource_id" TEXT NOT NULL,

    CONSTRAINT "bundle_resources_pkey" PRIMARY KEY ("bundle_id","resource_id")
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'bundle_resources_bundle_id_fkey') THEN
        ALTER TABLE "bundle_resources" ADD CONSTRAINT "bundle_resources_bundle_id_fkey" FOREIGN KEY ("bundle_id") REFERENCES "bundles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'bundle_resources_resource_id_fkey') THEN
        ALTER TABLE "bundle_resources" ADD CONSTRAINT "bundle_resources_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- ============================================================
-- Create follows table if not exists
-- ============================================================
CREATE TABLE IF NOT EXISTS "follows" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "follower_id" TEXT NOT NULL,
    "followed_id" TEXT NOT NULL,

    CONSTRAINT "follows_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "follows_follower_id_followed_id_key" ON "follows"("follower_id", "followed_id");

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'follows_follower_id_fkey') THEN
        ALTER TABLE "follows" ADD CONSTRAINT "follows_follower_id_fkey" FOREIGN KEY ("follower_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'follows_followed_id_fkey') THEN
        ALTER TABLE "follows" ADD CONSTRAINT "follows_followed_id_fkey" FOREIGN KEY ("followed_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
