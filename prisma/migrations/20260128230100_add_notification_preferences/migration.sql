-- Add notification preference fields for users
ALTER TABLE `users` ADD COLUMN `notify_new_from_followed` BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE `users` ADD COLUMN `notify_recommendations` BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE `users` ADD COLUMN `notify_material_updates` BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE `users` ADD COLUMN `notify_review_reminders` BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE `users` ADD COLUMN `notify_wishlist_price_drops` BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE `users` ADD COLUMN `notify_welcome_offers` BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE `users` ADD COLUMN `notify_sales` BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE `users` ADD COLUMN `notify_newsletter` BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE `users` ADD COLUMN `notify_platform_updates` BOOLEAN NOT NULL DEFAULT true;
