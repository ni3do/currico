-- CreateTable
CREATE TABLE `accounts` (
    `id` VARCHAR(50) NOT NULL,
    `userId` VARCHAR(50) NOT NULL,
    `type` VARCHAR(50) NOT NULL,
    `provider` VARCHAR(50) NOT NULL,
    `providerAccountId` VARCHAR(255) NOT NULL,
    `refresh_token` TEXT NULL,
    `access_token` TEXT NULL,
    `expires_at` INTEGER NULL,
    `token_type` VARCHAR(50) NULL,
    `scope` VARCHAR(500) NULL,
    `id_token` TEXT NULL,
    `session_state` VARCHAR(255) NULL,

    INDEX `accounts_userId_idx`(`userId`),
    UNIQUE INDEX `accounts_provider_providerAccountId_key`(`provider`, `providerAccountId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sessions` (
    `id` VARCHAR(50) NOT NULL,
    `sessionToken` VARCHAR(255) NOT NULL,
    `userId` VARCHAR(50) NOT NULL,
    `expires` DATETIME(0) NOT NULL,

    UNIQUE INDEX `sessions_sessionToken_key`(`sessionToken`),
    INDEX `sessions_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `verification_tokens` (
    `identifier` VARCHAR(255) NOT NULL,
    `token` VARCHAR(255) NOT NULL,
    `expires` DATETIME(0) NOT NULL,

    UNIQUE INDEX `verification_tokens_token_key`(`token`),
    UNIQUE INDEX `verification_tokens_identifier_token_key`(`identifier`, `token`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `email_verification_tokens` (
    `id` VARCHAR(50) NOT NULL,
    `token` VARCHAR(255) NOT NULL,
    `expires` DATETIME(0) NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `user_id` VARCHAR(50) NOT NULL,

    UNIQUE INDEX `email_verification_tokens_token_key`(`token`),
    INDEX `email_verification_tokens_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(50) NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `name` VARCHAR(255) NULL,
    `email` VARCHAR(255) NOT NULL,
    `emailVerified` DATETIME(0) NULL,
    `image` VARCHAR(500) NULL,
    `display_name` VARCHAR(100) NULL,
    `bio` TEXT NULL,
    `subjects` JSON NOT NULL,
    `cycles` JSON NOT NULL,
    `cantons` JSON NOT NULL,
    `password_hash` VARCHAR(255) NULL,
    `legal_first_name` VARCHAR(100) NULL,
    `legal_last_name` VARCHAR(100) NULL,
    `iban` VARCHAR(34) NULL,
    `address_street` VARCHAR(255) NULL,
    `address_city` VARCHAR(100) NULL,
    `address_postal` VARCHAR(10) NULL,
    `address_country` VARCHAR(2) NOT NULL DEFAULT 'CH',
    `role` ENUM('BUYER', 'SELLER', 'SCHOOL', 'ADMIN') NOT NULL DEFAULT 'BUYER',
    `is_seller` BOOLEAN NOT NULL DEFAULT false,
    `seller_verified` BOOLEAN NOT NULL DEFAULT false,
    `payout_enabled` BOOLEAN NOT NULL DEFAULT false,
    `is_protected` BOOLEAN NOT NULL DEFAULT false,
    `stripe_account_id` VARCHAR(255) NULL,
    `stripe_onboarding_complete` BOOLEAN NOT NULL DEFAULT false,
    `stripe_charges_enabled` BOOLEAN NOT NULL DEFAULT false,
    `stripe_payouts_enabled` BOOLEAN NOT NULL DEFAULT false,
    `stripe_customer_id` VARCHAR(255) NULL,
    `seller_terms_accepted_at` DATETIME(0) NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    INDEX `users_role_idx`(`role`),
    INDEX `users_is_seller_idx`(`is_seller`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `resources` (
    `id` VARCHAR(50) NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `price` INTEGER NOT NULL,
    `file_url` VARCHAR(500) NOT NULL,
    `preview_url` VARCHAR(500) NULL,
    `subjects` JSON NOT NULL,
    `cycles` JSON NOT NULL,
    `is_published` BOOLEAN NOT NULL DEFAULT false,
    `is_approved` BOOLEAN NOT NULL DEFAULT false,
    `status` ENUM('PENDING', 'VERIFIED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `is_public` BOOLEAN NOT NULL DEFAULT false,
    `eszett_checked` BOOLEAN NOT NULL DEFAULT false,
    `swiss_verified` BOOLEAN NOT NULL DEFAULT false,
    `language` VARCHAR(5) NOT NULL DEFAULT 'de',
    `seller_id` VARCHAR(50) NOT NULL,
    `is_mi_integrated` BOOLEAN NOT NULL DEFAULT false,

    INDEX `resources_seller_id_idx`(`seller_id`),
    INDEX `resources_is_published_is_public_idx`(`is_published`, `is_public`),
    INDEX `resources_status_idx`(`status`),
    INDEX `resources_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transactions` (
    `id` VARCHAR(50) NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `amount` INTEGER NOT NULL,
    `status` ENUM('PENDING', 'COMPLETED', 'REFUNDED', 'FAILED') NOT NULL DEFAULT 'PENDING',
    `stripe_payment_intent_id` VARCHAR(255) NULL,
    `stripe_checkout_session_id` VARCHAR(255) NULL,
    `payment_method` VARCHAR(50) NULL,
    `invoice_number` VARCHAR(50) NULL,
    `invoice_pdf_url` VARCHAR(500) NULL,
    `platform_fee_amount` INTEGER NULL,
    `seller_payout_amount` INTEGER NULL,
    `guest_email` VARCHAR(255) NULL,
    `buyer_id` VARCHAR(50) NULL,
    `resource_id` VARCHAR(50) NOT NULL,

    UNIQUE INDEX `transactions_stripe_payment_intent_id_key`(`stripe_payment_intent_id`),
    UNIQUE INDEX `transactions_invoice_number_key`(`invoice_number`),
    INDEX `transactions_buyer_id_idx`(`buyer_id`),
    INDEX `transactions_resource_id_idx`(`resource_id`),
    INDEX `transactions_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `download_tokens` (
    `id` VARCHAR(50) NOT NULL,
    `token` VARCHAR(255) NOT NULL,
    `expires_at` DATETIME(0) NOT NULL,
    `download_count` SMALLINT NOT NULL DEFAULT 0,
    `max_downloads` SMALLINT NOT NULL DEFAULT 5,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `transaction_id` VARCHAR(50) NOT NULL,

    UNIQUE INDEX `download_tokens_token_key`(`token`),
    INDEX `download_tokens_transaction_id_idx`(`transaction_id`),
    INDEX `download_tokens_expires_at_idx`(`expires_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reports` (
    `id` VARCHAR(50) NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `reason` VARCHAR(50) NOT NULL,
    `description` TEXT NULL,
    `status` ENUM('OPEN', 'IN_REVIEW', 'RESOLVED', 'DISMISSED') NOT NULL DEFAULT 'OPEN',
    `resolution` TEXT NULL,
    `resource_id` VARCHAR(50) NULL,
    `reported_user_id` VARCHAR(50) NULL,
    `reporter_id` VARCHAR(50) NOT NULL,
    `handled_by_id` VARCHAR(50) NULL,
    `handled_at` DATETIME(0) NULL,

    INDEX `reports_reporter_id_idx`(`reporter_id`),
    INDEX `reports_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contact_messages` (
    `id` VARCHAR(50) NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(50) NULL,
    `subject` VARCHAR(255) NOT NULL,
    `message` TEXT NOT NULL,
    `status` ENUM('NEW', 'READ', 'REPLIED', 'ARCHIVED') NOT NULL DEFAULT 'NEW',

    INDEX `contact_messages_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `curricula` (
    `id` VARCHAR(50) NOT NULL,
    `code` VARCHAR(10) NOT NULL,
    `name_de` VARCHAR(100) NOT NULL,
    `name_fr` VARCHAR(100) NULL,
    `name_it` VARCHAR(100) NULL,
    `region` VARCHAR(10) NOT NULL,

    UNIQUE INDEX `curricula_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `curriculum_subjects` (
    `id` VARCHAR(50) NOT NULL,
    `code` VARCHAR(10) NOT NULL,
    `name_de` VARCHAR(100) NOT NULL,
    `name_fr` VARCHAR(100) NULL,
    `name_it` VARCHAR(100) NULL,
    `color` VARCHAR(7) NULL,
    `icon` VARCHAR(50) NULL,
    `curriculum_id` VARCHAR(50) NOT NULL,

    INDEX `curriculum_subjects_curriculum_id_idx`(`curriculum_id`),
    UNIQUE INDEX `curriculum_subjects_curriculum_id_code_key`(`curriculum_id`, `code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `curriculum_competencies` (
    `id` VARCHAR(50) NOT NULL,
    `code` VARCHAR(20) NOT NULL,
    `description_de` TEXT NOT NULL,
    `description_fr` TEXT NULL,
    `description_it` TEXT NULL,
    `cycle` TINYINT NOT NULL,
    `kompetenzbereich` VARCHAR(100) NULL,
    `handlungsaspekt` VARCHAR(100) NULL,
    `anforderungsstufe` VARCHAR(20) NULL,
    `parent_id` VARCHAR(50) NULL,
    `subject_id` VARCHAR(50) NOT NULL,

    UNIQUE INDEX `curriculum_competencies_code_key`(`code`),
    INDEX `curriculum_competencies_subject_id_idx`(`subject_id`),
    INDEX `curriculum_competencies_cycle_idx`(`cycle`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lehrmittel` (
    `id` VARCHAR(50) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `publisher` VARCHAR(100) NOT NULL,
    `subject` VARCHAR(10) NOT NULL,
    `cantons` JSON NOT NULL,
    `cycles` JSON NOT NULL,

    INDEX `lehrmittel_subject_idx`(`subject`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transversal_competencies` (
    `id` VARCHAR(50) NOT NULL,
    `code` VARCHAR(10) NOT NULL,
    `category` VARCHAR(20) NOT NULL,
    `name_de` VARCHAR(100) NOT NULL,
    `name_fr` VARCHAR(100) NULL,
    `description_de` TEXT NOT NULL,
    `description_fr` TEXT NULL,
    `icon` VARCHAR(50) NULL,
    `color` VARCHAR(7) NULL,

    UNIQUE INDEX `transversal_competencies_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bne_themes` (
    `id` VARCHAR(50) NOT NULL,
    `code` VARCHAR(10) NOT NULL,
    `name_de` VARCHAR(100) NOT NULL,
    `name_fr` VARCHAR(100) NULL,
    `description_de` TEXT NOT NULL,
    `description_fr` TEXT NULL,
    `sdg_number` TINYINT NULL,
    `icon` VARCHAR(50) NULL,
    `color` VARCHAR(7) NULL,

    UNIQUE INDEX `bne_themes_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `resource_competencies` (
    `resource_id` VARCHAR(50) NOT NULL,
    `competency_id` VARCHAR(50) NOT NULL,

    INDEX `resource_competencies_competency_id_idx`(`competency_id`),
    PRIMARY KEY (`resource_id`, `competency_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `resource_lehrmittel` (
    `resource_id` VARCHAR(50) NOT NULL,
    `lehrmittel_id` VARCHAR(50) NOT NULL,

    INDEX `resource_lehrmittel_lehrmittel_id_idx`(`lehrmittel_id`),
    PRIMARY KEY (`resource_id`, `lehrmittel_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `resource_transversals` (
    `resource_id` VARCHAR(50) NOT NULL,
    `transversal_id` VARCHAR(50) NOT NULL,

    INDEX `resource_transversals_transversal_id_idx`(`transversal_id`),
    PRIMARY KEY (`resource_id`, `transversal_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `resource_bne` (
    `resource_id` VARCHAR(50) NOT NULL,
    `bne_id` VARCHAR(50) NOT NULL,

    INDEX `resource_bne_bne_id_idx`(`bne_id`),
    PRIMARY KEY (`resource_id`, `bne_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `downloads` (
    `id` VARCHAR(50) NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `user_id` VARCHAR(50) NOT NULL,
    `resource_id` VARCHAR(50) NOT NULL,

    INDEX `downloads_resource_id_idx`(`resource_id`),
    UNIQUE INDEX `downloads_user_id_resource_id_key`(`user_id`, `resource_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `wishlists` (
    `id` VARCHAR(50) NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `user_id` VARCHAR(50) NOT NULL,
    `resource_id` VARCHAR(50) NOT NULL,

    INDEX `wishlists_resource_id_idx`(`resource_id`),
    UNIQUE INDEX `wishlists_user_id_resource_id_key`(`user_id`, `resource_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `follows` (
    `id` VARCHAR(50) NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `follower_id` VARCHAR(50) NOT NULL,
    `followed_id` VARCHAR(50) NOT NULL,

    INDEX `follows_followed_id_idx`(`followed_id`),
    UNIQUE INDEX `follows_follower_id_followed_id_key`(`follower_id`, `followed_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `collections` (
    `id` VARCHAR(50) NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `is_public` BOOLEAN NOT NULL DEFAULT true,
    `position` SMALLINT NOT NULL DEFAULT 0,
    `owner_id` VARCHAR(50) NOT NULL,

    INDEX `collections_owner_id_idx`(`owner_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `collection_items` (
    `id` VARCHAR(50) NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `position` SMALLINT NOT NULL DEFAULT 0,
    `collection_id` VARCHAR(50) NOT NULL,
    `resource_id` VARCHAR(50) NOT NULL,

    INDEX `collection_items_resource_id_idx`(`resource_id`),
    UNIQUE INDEX `collection_items_collection_id_resource_id_key`(`collection_id`, `resource_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bundles` (
    `id` VARCHAR(50) NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `price` INTEGER NOT NULL,
    `subject` JSON NOT NULL,
    `cycle` JSON NOT NULL,
    `cover_image_url` VARCHAR(500) NULL,
    `is_published` BOOLEAN NOT NULL DEFAULT false,
    `status` ENUM('PENDING', 'VERIFIED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `seller_id` VARCHAR(50) NOT NULL,

    INDEX `bundles_seller_id_idx`(`seller_id`),
    INDEX `bundles_is_published_idx`(`is_published`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bundle_resources` (
    `id` VARCHAR(50) NOT NULL,
    `bundle_id` VARCHAR(50) NOT NULL,
    `resource_id` VARCHAR(50) NOT NULL,

    INDEX `bundle_resources_resource_id_idx`(`resource_id`),
    UNIQUE INDEX `bundle_resources_bundle_id_resource_id_key`(`bundle_id`, `resource_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `accounts` ADD CONSTRAINT `accounts_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `email_verification_tokens` ADD CONSTRAINT `email_verification_tokens_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resources` ADD CONSTRAINT `resources_seller_id_fkey` FOREIGN KEY (`seller_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_buyer_id_fkey` FOREIGN KEY (`buyer_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_resource_id_fkey` FOREIGN KEY (`resource_id`) REFERENCES `resources`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `download_tokens` ADD CONSTRAINT `download_tokens_transaction_id_fkey` FOREIGN KEY (`transaction_id`) REFERENCES `transactions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reports` ADD CONSTRAINT `reports_resource_id_fkey` FOREIGN KEY (`resource_id`) REFERENCES `resources`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reports` ADD CONSTRAINT `reports_reported_user_id_fkey` FOREIGN KEY (`reported_user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reports` ADD CONSTRAINT `reports_reporter_id_fkey` FOREIGN KEY (`reporter_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reports` ADD CONSTRAINT `reports_handled_by_id_fkey` FOREIGN KEY (`handled_by_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `curriculum_subjects` ADD CONSTRAINT `curriculum_subjects_curriculum_id_fkey` FOREIGN KEY (`curriculum_id`) REFERENCES `curricula`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `curriculum_competencies` ADD CONSTRAINT `curriculum_competencies_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `curriculum_competencies`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `curriculum_competencies` ADD CONSTRAINT `curriculum_competencies_subject_id_fkey` FOREIGN KEY (`subject_id`) REFERENCES `curriculum_subjects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resource_competencies` ADD CONSTRAINT `resource_competencies_resource_id_fkey` FOREIGN KEY (`resource_id`) REFERENCES `resources`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resource_competencies` ADD CONSTRAINT `resource_competencies_competency_id_fkey` FOREIGN KEY (`competency_id`) REFERENCES `curriculum_competencies`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resource_lehrmittel` ADD CONSTRAINT `resource_lehrmittel_resource_id_fkey` FOREIGN KEY (`resource_id`) REFERENCES `resources`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resource_lehrmittel` ADD CONSTRAINT `resource_lehrmittel_lehrmittel_id_fkey` FOREIGN KEY (`lehrmittel_id`) REFERENCES `lehrmittel`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resource_transversals` ADD CONSTRAINT `resource_transversals_resource_id_fkey` FOREIGN KEY (`resource_id`) REFERENCES `resources`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resource_transversals` ADD CONSTRAINT `resource_transversals_transversal_id_fkey` FOREIGN KEY (`transversal_id`) REFERENCES `transversal_competencies`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resource_bne` ADD CONSTRAINT `resource_bne_resource_id_fkey` FOREIGN KEY (`resource_id`) REFERENCES `resources`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `resource_bne` ADD CONSTRAINT `resource_bne_bne_id_fkey` FOREIGN KEY (`bne_id`) REFERENCES `bne_themes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `downloads` ADD CONSTRAINT `downloads_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `downloads` ADD CONSTRAINT `downloads_resource_id_fkey` FOREIGN KEY (`resource_id`) REFERENCES `resources`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wishlists` ADD CONSTRAINT `wishlists_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wishlists` ADD CONSTRAINT `wishlists_resource_id_fkey` FOREIGN KEY (`resource_id`) REFERENCES `resources`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `follows` ADD CONSTRAINT `follows_follower_id_fkey` FOREIGN KEY (`follower_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `follows` ADD CONSTRAINT `follows_followed_id_fkey` FOREIGN KEY (`followed_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `collections` ADD CONSTRAINT `collections_owner_id_fkey` FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `collection_items` ADD CONSTRAINT `collection_items_collection_id_fkey` FOREIGN KEY (`collection_id`) REFERENCES `collections`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `collection_items` ADD CONSTRAINT `collection_items_resource_id_fkey` FOREIGN KEY (`resource_id`) REFERENCES `resources`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bundles` ADD CONSTRAINT `bundles_seller_id_fkey` FOREIGN KEY (`seller_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bundle_resources` ADD CONSTRAINT `bundle_resources_bundle_id_fkey` FOREIGN KEY (`bundle_id`) REFERENCES `bundles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bundle_resources` ADD CONSTRAINT `bundle_resources_resource_id_fkey` FOREIGN KEY (`resource_id`) REFERENCES `resources`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
