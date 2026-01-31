-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('BUYER', 'SELLER', 'SCHOOL', 'ADMIN');

-- CreateEnum
CREATE TYPE "ResourceStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'COMPLETED', 'REFUNDED', 'FAILED');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('OPEN', 'IN_REVIEW', 'RESOLVED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "ContactMessageStatus" AS ENUM ('NEW', 'READ', 'REPLIED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "accounts" (
    "id" VARCHAR(50) NOT NULL,
    "userId" VARCHAR(50) NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "provider" VARCHAR(50) NOT NULL,
    "providerAccountId" VARCHAR(255) NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" VARCHAR(50),
    "scope" VARCHAR(500),
    "id_token" TEXT,
    "session_state" VARCHAR(255),

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" VARCHAR(50) NOT NULL,
    "sessionToken" VARCHAR(255) NOT NULL,
    "userId" VARCHAR(50) NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" VARCHAR(255) NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "email_verification_tokens" (
    "id" VARCHAR(50) NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" VARCHAR(50) NOT NULL,

    CONSTRAINT "email_verification_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "name" VARCHAR(255),
    "email" VARCHAR(255) NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" VARCHAR(500),
    "display_name" VARCHAR(100),
    "bio" TEXT,
    "subjects" JSONB NOT NULL DEFAULT '[]',
    "cycles" JSONB NOT NULL DEFAULT '[]',
    "cantons" JSONB NOT NULL DEFAULT '[]',
    "instagram" VARCHAR(100),
    "pinterest" VARCHAR(100),
    "password_hash" VARCHAR(255),
    "role" "UserRole" NOT NULL DEFAULT 'BUYER',
    "is_protected" BOOLEAN NOT NULL DEFAULT false,
    "is_private" BOOLEAN NOT NULL DEFAULT false,
    "stripe_account_id" VARCHAR(255),
    "stripe_onboarding_complete" BOOLEAN NOT NULL DEFAULT false,
    "stripe_charges_enabled" BOOLEAN NOT NULL DEFAULT false,
    "stripe_payouts_enabled" BOOLEAN NOT NULL DEFAULT false,
    "stripe_customer_id" VARCHAR(255),
    "seller_terms_accepted_at" TIMESTAMP(3),
    "notify_new_from_followed" BOOLEAN NOT NULL DEFAULT true,
    "notify_recommendations" BOOLEAN NOT NULL DEFAULT true,
    "notify_material_updates" BOOLEAN NOT NULL DEFAULT true,
    "notify_review_reminders" BOOLEAN NOT NULL DEFAULT true,
    "notify_wishlist_price_drops" BOOLEAN NOT NULL DEFAULT true,
    "notify_welcome_offers" BOOLEAN NOT NULL DEFAULT true,
    "notify_sales" BOOLEAN NOT NULL DEFAULT true,
    "notify_newsletter" BOOLEAN NOT NULL DEFAULT false,
    "notify_platform_updates" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resources" (
    "id" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "file_url" VARCHAR(500) NOT NULL,
    "preview_url" VARCHAR(500),
    "subjects" JSONB NOT NULL DEFAULT '[]',
    "cycles" JSONB NOT NULL DEFAULT '[]',
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "is_approved" BOOLEAN NOT NULL DEFAULT false,
    "status" "ResourceStatus" NOT NULL DEFAULT 'PENDING',
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "eszett_checked" BOOLEAN NOT NULL DEFAULT false,
    "swiss_verified" BOOLEAN NOT NULL DEFAULT false,
    "language" VARCHAR(5) NOT NULL DEFAULT 'de',
    "seller_id" VARCHAR(50) NOT NULL,
    "is_mi_integrated" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount" INTEGER NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "stripe_payment_intent_id" VARCHAR(255),
    "stripe_checkout_session_id" VARCHAR(255),
    "payment_method" VARCHAR(50),
    "invoice_number" VARCHAR(50),
    "invoice_pdf_url" VARCHAR(500),
    "platform_fee_amount" INTEGER,
    "seller_payout_amount" INTEGER,
    "guest_email" VARCHAR(255),
    "buyer_id" VARCHAR(50),
    "resource_id" VARCHAR(50) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "download_tokens" (
    "id" VARCHAR(50) NOT NULL,
    "token" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "download_count" SMALLINT NOT NULL DEFAULT 0,
    "max_downloads" SMALLINT NOT NULL DEFAULT 5,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "transaction_id" VARCHAR(50) NOT NULL,

    CONSTRAINT "download_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "reason" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'OPEN',
    "resolution" TEXT,
    "resource_id" VARCHAR(50),
    "reported_user_id" VARCHAR(50),
    "reporter_id" VARCHAR(50) NOT NULL,
    "handled_by_id" VARCHAR(50),
    "handled_at" TIMESTAMP(3),

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_messages" (
    "id" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(50),
    "subject" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "status" "ContactMessageStatus" NOT NULL DEFAULT 'NEW',

    CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "curricula" (
    "id" VARCHAR(50) NOT NULL,
    "code" VARCHAR(10) NOT NULL,
    "name_de" VARCHAR(100) NOT NULL,
    "name_fr" VARCHAR(100),
    "name_it" VARCHAR(100),
    "region" VARCHAR(10) NOT NULL,

    CONSTRAINT "curricula_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "curriculum_subjects" (
    "id" VARCHAR(50) NOT NULL,
    "code" VARCHAR(10) NOT NULL,
    "name_de" VARCHAR(100) NOT NULL,
    "name_fr" VARCHAR(100),
    "name_it" VARCHAR(100),
    "color" VARCHAR(7),
    "icon" VARCHAR(50),
    "curriculum_id" VARCHAR(50) NOT NULL,

    CONSTRAINT "curriculum_subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "curriculum_competencies" (
    "id" VARCHAR(50) NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "description_de" TEXT NOT NULL,
    "description_fr" TEXT,
    "description_it" TEXT,
    "cycle" SMALLINT NOT NULL,
    "kompetenzbereich" VARCHAR(100),
    "handlungsaspekt" VARCHAR(100),
    "anforderungsstufe" VARCHAR(20),
    "parent_id" VARCHAR(50),
    "subject_id" VARCHAR(50) NOT NULL,

    CONSTRAINT "curriculum_competencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lehrmittel" (
    "id" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "publisher" VARCHAR(100) NOT NULL,
    "subject" VARCHAR(10) NOT NULL,
    "cantons" JSONB NOT NULL DEFAULT '[]',
    "cycles" JSONB NOT NULL DEFAULT '[]',

    CONSTRAINT "lehrmittel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transversal_competencies" (
    "id" VARCHAR(50) NOT NULL,
    "code" VARCHAR(10) NOT NULL,
    "category" VARCHAR(20) NOT NULL,
    "name_de" VARCHAR(100) NOT NULL,
    "name_fr" VARCHAR(100),
    "description_de" TEXT NOT NULL,
    "description_fr" TEXT,
    "icon" VARCHAR(50),
    "color" VARCHAR(7),

    CONSTRAINT "transversal_competencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bne_themes" (
    "id" VARCHAR(50) NOT NULL,
    "code" VARCHAR(10) NOT NULL,
    "name_de" VARCHAR(100) NOT NULL,
    "name_fr" VARCHAR(100),
    "description_de" TEXT NOT NULL,
    "description_fr" TEXT,
    "sdg_number" SMALLINT,
    "icon" VARCHAR(50),
    "color" VARCHAR(7),

    CONSTRAINT "bne_themes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resource_competencies" (
    "resource_id" VARCHAR(50) NOT NULL,
    "competency_id" VARCHAR(50) NOT NULL,

    CONSTRAINT "resource_competencies_pkey" PRIMARY KEY ("resource_id","competency_id")
);

-- CreateTable
CREATE TABLE "resource_lehrmittel" (
    "resource_id" VARCHAR(50) NOT NULL,
    "lehrmittel_id" VARCHAR(50) NOT NULL,

    CONSTRAINT "resource_lehrmittel_pkey" PRIMARY KEY ("resource_id","lehrmittel_id")
);

-- CreateTable
CREATE TABLE "resource_transversals" (
    "resource_id" VARCHAR(50) NOT NULL,
    "transversal_id" VARCHAR(50) NOT NULL,

    CONSTRAINT "resource_transversals_pkey" PRIMARY KEY ("resource_id","transversal_id")
);

-- CreateTable
CREATE TABLE "resource_bne" (
    "resource_id" VARCHAR(50) NOT NULL,
    "bne_id" VARCHAR(50) NOT NULL,

    CONSTRAINT "resource_bne_pkey" PRIMARY KEY ("resource_id","bne_id")
);

-- CreateTable
CREATE TABLE "downloads" (
    "id" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" VARCHAR(50) NOT NULL,
    "resource_id" VARCHAR(50) NOT NULL,

    CONSTRAINT "downloads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wishlists" (
    "id" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" VARCHAR(50) NOT NULL,
    "resource_id" VARCHAR(50) NOT NULL,

    CONSTRAINT "wishlists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "follows" (
    "id" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "follower_id" VARCHAR(50) NOT NULL,
    "followed_id" VARCHAR(50) NOT NULL,

    CONSTRAINT "follows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collections" (
    "id" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "position" SMALLINT NOT NULL DEFAULT 0,
    "owner_id" VARCHAR(50) NOT NULL,

    CONSTRAINT "collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collection_items" (
    "id" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "position" SMALLINT NOT NULL DEFAULT 0,
    "collection_id" VARCHAR(50) NOT NULL,
    "resource_id" VARCHAR(50) NOT NULL,

    CONSTRAINT "collection_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bundles" (
    "id" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "price" INTEGER NOT NULL,
    "subject" JSONB NOT NULL DEFAULT '[]',
    "cycle" JSONB NOT NULL DEFAULT '[]',
    "cover_image_url" VARCHAR(500),
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "status" "ResourceStatus" NOT NULL DEFAULT 'PENDING',
    "seller_id" VARCHAR(50) NOT NULL,

    CONSTRAINT "bundles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bundle_resources" (
    "id" VARCHAR(50) NOT NULL,
    "bundle_id" VARCHAR(50) NOT NULL,
    "resource_id" VARCHAR(50) NOT NULL,

    CONSTRAINT "bundle_resources_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "accounts_userId_idx" ON "accounts"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "email_verification_tokens_token_key" ON "email_verification_tokens"("token");

-- CreateIndex
CREATE INDEX "email_verification_tokens_user_id_idx" ON "email_verification_tokens"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "resources_seller_id_idx" ON "resources"("seller_id");

-- CreateIndex
CREATE INDEX "resources_is_published_is_public_idx" ON "resources"("is_published", "is_public");

-- CreateIndex
CREATE INDEX "resources_status_idx" ON "resources"("status");

-- CreateIndex
CREATE INDEX "resources_created_at_idx" ON "resources"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_stripe_payment_intent_id_key" ON "transactions"("stripe_payment_intent_id");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_invoice_number_key" ON "transactions"("invoice_number");

-- CreateIndex
CREATE INDEX "transactions_buyer_id_idx" ON "transactions"("buyer_id");

-- CreateIndex
CREATE INDEX "transactions_resource_id_idx" ON "transactions"("resource_id");

-- CreateIndex
CREATE INDEX "transactions_status_idx" ON "transactions"("status");

-- CreateIndex
CREATE UNIQUE INDEX "download_tokens_token_key" ON "download_tokens"("token");

-- CreateIndex
CREATE INDEX "download_tokens_transaction_id_idx" ON "download_tokens"("transaction_id");

-- CreateIndex
CREATE INDEX "download_tokens_expires_at_idx" ON "download_tokens"("expires_at");

-- CreateIndex
CREATE INDEX "reports_reporter_id_idx" ON "reports"("reporter_id");

-- CreateIndex
CREATE INDEX "reports_status_idx" ON "reports"("status");

-- CreateIndex
CREATE INDEX "contact_messages_status_idx" ON "contact_messages"("status");

-- CreateIndex
CREATE UNIQUE INDEX "curricula_code_key" ON "curricula"("code");

-- CreateIndex
CREATE INDEX "curriculum_subjects_curriculum_id_idx" ON "curriculum_subjects"("curriculum_id");

-- CreateIndex
CREATE UNIQUE INDEX "curriculum_subjects_curriculum_id_code_key" ON "curriculum_subjects"("curriculum_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "curriculum_competencies_code_key" ON "curriculum_competencies"("code");

-- CreateIndex
CREATE INDEX "curriculum_competencies_subject_id_idx" ON "curriculum_competencies"("subject_id");

-- CreateIndex
CREATE INDEX "curriculum_competencies_cycle_idx" ON "curriculum_competencies"("cycle");

-- CreateIndex
CREATE INDEX "lehrmittel_subject_idx" ON "lehrmittel"("subject");

-- CreateIndex
CREATE UNIQUE INDEX "transversal_competencies_code_key" ON "transversal_competencies"("code");

-- CreateIndex
CREATE UNIQUE INDEX "bne_themes_code_key" ON "bne_themes"("code");

-- CreateIndex
CREATE INDEX "resource_competencies_competency_id_idx" ON "resource_competencies"("competency_id");

-- CreateIndex
CREATE INDEX "resource_lehrmittel_lehrmittel_id_idx" ON "resource_lehrmittel"("lehrmittel_id");

-- CreateIndex
CREATE INDEX "resource_transversals_transversal_id_idx" ON "resource_transversals"("transversal_id");

-- CreateIndex
CREATE INDEX "resource_bne_bne_id_idx" ON "resource_bne"("bne_id");

-- CreateIndex
CREATE INDEX "downloads_resource_id_idx" ON "downloads"("resource_id");

-- CreateIndex
CREATE UNIQUE INDEX "downloads_user_id_resource_id_key" ON "downloads"("user_id", "resource_id");

-- CreateIndex
CREATE INDEX "wishlists_resource_id_idx" ON "wishlists"("resource_id");

-- CreateIndex
CREATE UNIQUE INDEX "wishlists_user_id_resource_id_key" ON "wishlists"("user_id", "resource_id");

-- CreateIndex
CREATE INDEX "follows_followed_id_idx" ON "follows"("followed_id");

-- CreateIndex
CREATE UNIQUE INDEX "follows_follower_id_followed_id_key" ON "follows"("follower_id", "followed_id");

-- CreateIndex
CREATE INDEX "collections_owner_id_idx" ON "collections"("owner_id");

-- CreateIndex
CREATE INDEX "collection_items_resource_id_idx" ON "collection_items"("resource_id");

-- CreateIndex
CREATE UNIQUE INDEX "collection_items_collection_id_resource_id_key" ON "collection_items"("collection_id", "resource_id");

-- CreateIndex
CREATE INDEX "bundles_seller_id_idx" ON "bundles"("seller_id");

-- CreateIndex
CREATE INDEX "bundles_is_published_idx" ON "bundles"("is_published");

-- CreateIndex
CREATE INDEX "bundle_resources_resource_id_idx" ON "bundle_resources"("resource_id");

-- CreateIndex
CREATE UNIQUE INDEX "bundle_resources_bundle_id_resource_id_key" ON "bundle_resources"("bundle_id", "resource_id");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_verification_tokens" ADD CONSTRAINT "email_verification_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resources" ADD CONSTRAINT "resources_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "resources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "download_tokens" ADD CONSTRAINT "download_tokens_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "resources"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_reported_user_id_fkey" FOREIGN KEY ("reported_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_handled_by_id_fkey" FOREIGN KEY ("handled_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_subjects" ADD CONSTRAINT "curriculum_subjects_curriculum_id_fkey" FOREIGN KEY ("curriculum_id") REFERENCES "curricula"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_competencies" ADD CONSTRAINT "curriculum_competencies_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "curriculum_competencies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curriculum_competencies" ADD CONSTRAINT "curriculum_competencies_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "curriculum_subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_competencies" ADD CONSTRAINT "resource_competencies_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_competencies" ADD CONSTRAINT "resource_competencies_competency_id_fkey" FOREIGN KEY ("competency_id") REFERENCES "curriculum_competencies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_lehrmittel" ADD CONSTRAINT "resource_lehrmittel_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_lehrmittel" ADD CONSTRAINT "resource_lehrmittel_lehrmittel_id_fkey" FOREIGN KEY ("lehrmittel_id") REFERENCES "lehrmittel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_transversals" ADD CONSTRAINT "resource_transversals_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_transversals" ADD CONSTRAINT "resource_transversals_transversal_id_fkey" FOREIGN KEY ("transversal_id") REFERENCES "transversal_competencies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_bne" ADD CONSTRAINT "resource_bne_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_bne" ADD CONSTRAINT "resource_bne_bne_id_fkey" FOREIGN KEY ("bne_id") REFERENCES "bne_themes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "downloads" ADD CONSTRAINT "downloads_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "downloads" ADD CONSTRAINT "downloads_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlists" ADD CONSTRAINT "wishlists_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlists" ADD CONSTRAINT "wishlists_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follows" ADD CONSTRAINT "follows_follower_id_fkey" FOREIGN KEY ("follower_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follows" ADD CONSTRAINT "follows_followed_id_fkey" FOREIGN KEY ("followed_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collections" ADD CONSTRAINT "collections_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_items" ADD CONSTRAINT "collection_items_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_items" ADD CONSTRAINT "collection_items_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bundles" ADD CONSTRAINT "bundles_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bundle_resources" ADD CONSTRAINT "bundle_resources_bundle_id_fkey" FOREIGN KEY ("bundle_id") REFERENCES "bundles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bundle_resources" ADD CONSTRAINT "bundle_resources_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;
