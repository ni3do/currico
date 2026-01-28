-- Add is_private field for user profile visibility
ALTER TABLE `users` ADD COLUMN `is_private` BOOLEAN NOT NULL DEFAULT false;
