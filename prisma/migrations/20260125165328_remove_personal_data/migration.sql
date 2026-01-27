-- Remove unnecessary personal data fields from users table
-- These fields are now handled by Stripe Connect (IBAN, address, legal name for KYC)

ALTER TABLE `users` DROP COLUMN `legal_first_name`;
ALTER TABLE `users` DROP COLUMN `legal_last_name`;
ALTER TABLE `users` DROP COLUMN `iban`;
ALTER TABLE `users` DROP COLUMN `address_street`;
ALTER TABLE `users` DROP COLUMN `address_city`;
ALTER TABLE `users` DROP COLUMN `address_postal`;
ALTER TABLE `users` DROP COLUMN `address_country`;

-- Remove deprecated seller status fields (use role and Stripe status instead)
DROP INDEX `users_is_seller_idx` ON `users`;
ALTER TABLE `users` DROP COLUMN `is_seller`;
ALTER TABLE `users` DROP COLUMN `seller_verified`;
ALTER TABLE `users` DROP COLUMN `payout_enabled`;
