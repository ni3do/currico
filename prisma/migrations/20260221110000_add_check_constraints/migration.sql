-- Add database-level integrity constraints

-- Review rating must be between 1 and 5
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_rating_range" CHECK ("rating" >= 1 AND "rating" <= 5);

-- Transaction amount must be positive
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_amount_positive" CHECK ("amount" > 0);

-- Resource price must be non-negative (0 = free)
ALTER TABLE "resources" ADD CONSTRAINT "resources_price_non_negative" CHECK ("price" >= 0);

-- Bundle price must be non-negative
ALTER TABLE "bundles" ADD CONSTRAINT "bundles_price_non_negative" CHECK ("price" >= 0);

-- Users cannot follow themselves
ALTER TABLE "follows" ADD CONSTRAINT "follows_no_self_follow" CHECK ("follower_id" != "followed_id");
