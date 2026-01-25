-- Combined Initial Migration for Easy-Lehrer
-- Created: 2026-01-18
-- This migration creates all tables from scratch

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE "UserRole" AS ENUM ('BUYER', 'SELLER', 'ADMIN');
CREATE TYPE "ResourceStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'COMPLETED', 'REFUNDED', 'FAILED');
CREATE TYPE "ReportStatus" AS ENUM ('OPEN', 'IN_REVIEW', 'RESOLVED', 'DISMISSED');
CREATE TYPE "ContactMessageStatus" AS ENUM ('NEW', 'READ', 'REPLIED', 'ARCHIVED');

-- ============================================================
-- NEXTAUTH.JS TABLES
-- ============================================================

CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "email_verification_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "email_verification_tokens_pkey" PRIMARY KEY ("id")
);

-- ============================================================
-- USER TABLE
-- ============================================================

CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "display_name" TEXT,
    "bio" TEXT,
    "subjects" TEXT[],
    "cycles" TEXT[],
    "cantons" TEXT[],
    "password_hash" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'BUYER',
    "is_protected" BOOLEAN NOT NULL DEFAULT false,
    "stripe_customer_id" TEXT,
    "stripe_account_id" TEXT,
    "stripe_onboarding_complete" BOOLEAN NOT NULL DEFAULT false,
    "stripe_charges_enabled" BOOLEAN NOT NULL DEFAULT false,
    "stripe_payouts_enabled" BOOLEAN NOT NULL DEFAULT false,
    "seller_terms_accepted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- ============================================================
-- RESOURCE TABLE
-- ============================================================

CREATE TABLE "resources" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "file_url" TEXT NOT NULL,
    "preview_url" TEXT,
    "subjects" TEXT[],
    "cycles" TEXT[],
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "is_approved" BOOLEAN NOT NULL DEFAULT false,
    "status" "ResourceStatus" NOT NULL DEFAULT 'PENDING',
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "eszett_checked" BOOLEAN NOT NULL DEFAULT false,
    "swiss_verified" BOOLEAN NOT NULL DEFAULT false,
    "language" TEXT NOT NULL DEFAULT 'de',
    "seller_id" TEXT NOT NULL,
    "is_mi_integrated" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "resources_pkey" PRIMARY KEY ("id")
);

-- ============================================================
-- BUNDLE TABLES
-- ============================================================

CREATE TABLE "bundles" (
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

CREATE TABLE "bundle_resources" (
    "bundle_id" TEXT NOT NULL,
    "resource_id" TEXT NOT NULL,

    CONSTRAINT "bundle_resources_pkey" PRIMARY KEY ("bundle_id","resource_id")
);

-- ============================================================
-- TRANSACTION TABLE
-- ============================================================

CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount" INTEGER NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "stripe_payment_intent_id" TEXT,
    "stripe_checkout_session_id" TEXT,
    "payment_method" TEXT,
    "invoice_number" TEXT,
    "invoice_pdf_url" TEXT,
    "platform_fee_amount" INTEGER,
    "seller_payout_amount" INTEGER,
    "guest_email" TEXT,
    "buyer_id" TEXT,
    "resource_id" TEXT NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- ============================================================
-- REPORT TABLE
-- ============================================================

CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "reason" TEXT NOT NULL,
    "description" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'OPEN',
    "resolution" TEXT,
    "resource_id" TEXT,
    "reported_user_id" TEXT,
    "reporter_id" TEXT NOT NULL,
    "handled_by_id" TEXT,
    "handled_at" TIMESTAMP(3),

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- ============================================================
-- CONTACT MESSAGE TABLE
-- ============================================================

CREATE TABLE "contact_messages" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "ContactMessageStatus" NOT NULL DEFAULT 'NEW',

    CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id")
);

-- ============================================================
-- CURRICULUM TABLES
-- ============================================================

CREATE TABLE "curricula" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name_de" TEXT NOT NULL,
    "name_fr" TEXT,
    "name_it" TEXT,
    "region" TEXT NOT NULL,

    CONSTRAINT "curricula_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "curriculum_subjects" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name_de" TEXT NOT NULL,
    "name_fr" TEXT,
    "name_it" TEXT,
    "color" TEXT,
    "icon" TEXT,
    "curriculum_id" TEXT NOT NULL,

    CONSTRAINT "curriculum_subjects_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "curriculum_competencies" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description_de" TEXT NOT NULL,
    "description_fr" TEXT,
    "description_it" TEXT,
    "cycle" INTEGER NOT NULL,
    "kompetenzbereich" TEXT,
    "handlungsaspekt" TEXT,
    "anforderungsstufe" TEXT,
    "parent_id" TEXT,
    "subject_id" TEXT NOT NULL,

    CONSTRAINT "curriculum_competencies_pkey" PRIMARY KEY ("id")
);

-- ============================================================
-- LEHRMITTEL TABLE
-- ============================================================

CREATE TABLE "lehrmittel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "publisher" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "cantons" TEXT[],
    "cycles" INTEGER[],

    CONSTRAINT "lehrmittel_pkey" PRIMARY KEY ("id")
);

-- ============================================================
-- TRANSVERSAL COMPETENCIES TABLE
-- ============================================================

CREATE TABLE "transversal_competencies" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "name_de" TEXT NOT NULL,
    "name_fr" TEXT,
    "description_de" TEXT NOT NULL,
    "description_fr" TEXT,
    "icon" TEXT,
    "color" TEXT,

    CONSTRAINT "transversal_competencies_pkey" PRIMARY KEY ("id")
);

-- ============================================================
-- BNE THEMES TABLE
-- ============================================================

CREATE TABLE "bne_themes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name_de" TEXT NOT NULL,
    "name_fr" TEXT,
    "description_de" TEXT NOT NULL,
    "description_fr" TEXT,
    "sdg_number" INTEGER,
    "icon" TEXT,
    "color" TEXT,

    CONSTRAINT "bne_themes_pkey" PRIMARY KEY ("id")
);

-- ============================================================
-- JUNCTION TABLES
-- ============================================================

CREATE TABLE "resource_competencies" (
    "resource_id" TEXT NOT NULL,
    "competency_id" TEXT NOT NULL,

    CONSTRAINT "resource_competencies_pkey" PRIMARY KEY ("resource_id","competency_id")
);

CREATE TABLE "resource_lehrmittel" (
    "resource_id" TEXT NOT NULL,
    "lehrmittel_id" TEXT NOT NULL,

    CONSTRAINT "resource_lehrmittel_pkey" PRIMARY KEY ("resource_id","lehrmittel_id")
);

CREATE TABLE "resource_transversals" (
    "resource_id" TEXT NOT NULL,
    "transversal_id" TEXT NOT NULL,

    CONSTRAINT "resource_transversals_pkey" PRIMARY KEY ("resource_id","transversal_id")
);

CREATE TABLE "resource_bne" (
    "resource_id" TEXT NOT NULL,
    "bne_id" TEXT NOT NULL,

    CONSTRAINT "resource_bne_pkey" PRIMARY KEY ("resource_id","bne_id")
);

-- ============================================================
-- DOWNLOAD TABLES
-- ============================================================

CREATE TABLE "downloads" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,
    "resource_id" TEXT NOT NULL,

    CONSTRAINT "downloads_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "download_tokens" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "download_count" INTEGER NOT NULL DEFAULT 0,
    "max_downloads" INTEGER NOT NULL DEFAULT 3,
    "transaction_id" TEXT NOT NULL,

    CONSTRAINT "download_tokens_pkey" PRIMARY KEY ("id")
);

-- ============================================================
-- WISHLIST TABLE
-- ============================================================

CREATE TABLE "wishlists" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,
    "resource_id" TEXT NOT NULL,

    CONSTRAINT "wishlists_pkey" PRIMARY KEY ("id")
);

-- ============================================================
-- FOLLOW TABLE
-- ============================================================

CREATE TABLE "follows" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "follower_id" TEXT NOT NULL,
    "followed_id" TEXT NOT NULL,

    CONSTRAINT "follows_pkey" PRIMARY KEY ("id")
);

-- ============================================================
-- UNIQUE INDEXES
-- ============================================================

CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");
CREATE UNIQUE INDEX "email_verification_tokens_token_key" ON "email_verification_tokens"("token");
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "transactions_stripe_payment_intent_id_key" ON "transactions"("stripe_payment_intent_id");
CREATE UNIQUE INDEX "transactions_invoice_number_key" ON "transactions"("invoice_number");
CREATE UNIQUE INDEX "curricula_code_key" ON "curricula"("code");
CREATE UNIQUE INDEX "curriculum_subjects_curriculum_id_code_key" ON "curriculum_subjects"("curriculum_id", "code");
CREATE UNIQUE INDEX "curriculum_competencies_code_key" ON "curriculum_competencies"("code");
CREATE UNIQUE INDEX "transversal_competencies_code_key" ON "transversal_competencies"("code");
CREATE UNIQUE INDEX "bne_themes_code_key" ON "bne_themes"("code");
CREATE UNIQUE INDEX "downloads_user_id_resource_id_key" ON "downloads"("user_id", "resource_id");
CREATE UNIQUE INDEX "download_tokens_token_key" ON "download_tokens"("token");
CREATE UNIQUE INDEX "wishlists_user_id_resource_id_key" ON "wishlists"("user_id", "resource_id");
CREATE UNIQUE INDEX "follows_follower_id_followed_id_key" ON "follows"("follower_id", "followed_id");

-- ============================================================
-- FOREIGN KEYS
-- ============================================================

-- Accounts
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Sessions
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Email Verification Tokens
ALTER TABLE "email_verification_tokens" ADD CONSTRAINT "email_verification_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Resources
ALTER TABLE "resources" ADD CONSTRAINT "resources_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Bundles
ALTER TABLE "bundles" ADD CONSTRAINT "bundles_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Bundle Resources
ALTER TABLE "bundle_resources" ADD CONSTRAINT "bundle_resources_bundle_id_fkey" FOREIGN KEY ("bundle_id") REFERENCES "bundles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "bundle_resources" ADD CONSTRAINT "bundle_resources_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Transactions
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "resources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Reports
ALTER TABLE "reports" ADD CONSTRAINT "reports_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "resources"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "reports" ADD CONSTRAINT "reports_reported_user_id_fkey" FOREIGN KEY ("reported_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reports" ADD CONSTRAINT "reports_handled_by_id_fkey" FOREIGN KEY ("handled_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Curriculum
ALTER TABLE "curriculum_subjects" ADD CONSTRAINT "curriculum_subjects_curriculum_id_fkey" FOREIGN KEY ("curriculum_id") REFERENCES "curricula"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "curriculum_competencies" ADD CONSTRAINT "curriculum_competencies_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "curriculum_competencies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "curriculum_competencies" ADD CONSTRAINT "curriculum_competencies_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "curriculum_subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Resource Competencies
ALTER TABLE "resource_competencies" ADD CONSTRAINT "resource_competencies_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "resource_competencies" ADD CONSTRAINT "resource_competencies_competency_id_fkey" FOREIGN KEY ("competency_id") REFERENCES "curriculum_competencies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Resource Lehrmittel
ALTER TABLE "resource_lehrmittel" ADD CONSTRAINT "resource_lehrmittel_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "resource_lehrmittel" ADD CONSTRAINT "resource_lehrmittel_lehrmittel_id_fkey" FOREIGN KEY ("lehrmittel_id") REFERENCES "lehrmittel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Resource Transversals
ALTER TABLE "resource_transversals" ADD CONSTRAINT "resource_transversals_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "resource_transversals" ADD CONSTRAINT "resource_transversals_transversal_id_fkey" FOREIGN KEY ("transversal_id") REFERENCES "transversal_competencies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Resource BNE
ALTER TABLE "resource_bne" ADD CONSTRAINT "resource_bne_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "resource_bne" ADD CONSTRAINT "resource_bne_bne_id_fkey" FOREIGN KEY ("bne_id") REFERENCES "bne_themes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Downloads
ALTER TABLE "downloads" ADD CONSTRAINT "downloads_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "downloads" ADD CONSTRAINT "downloads_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Download Tokens
ALTER TABLE "download_tokens" ADD CONSTRAINT "download_tokens_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Wishlists
ALTER TABLE "wishlists" ADD CONSTRAINT "wishlists_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "wishlists" ADD CONSTRAINT "wishlists_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Follows
ALTER TABLE "follows" ADD CONSTRAINT "follows_follower_id_fkey" FOREIGN KEY ("follower_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "follows" ADD CONSTRAINT "follows_followed_id_fkey" FOREIGN KEY ("followed_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
