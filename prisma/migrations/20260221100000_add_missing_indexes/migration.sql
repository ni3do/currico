-- Add missing indexes for performance optimization

-- Comment: index on user_id for profile page queries
CREATE INDEX "comments_user_id_idx" ON "comments"("user_id");

-- Review: index on user_id for profile page queries
CREATE INDEX "reviews_user_id_idx" ON "reviews"("user_id");

-- Follow: index on follower_id for "following" list queries
CREATE INDEX "follows_follower_id_idx" ON "follows"("follower_id");

-- Transaction: index on created_at for date-range queries and admin stats
CREATE INDEX "transactions_created_at_idx" ON "transactions"("created_at");

-- Resource: composite index for search queries (published + public + created_at)
CREATE INDEX "resources_is_published_is_public_created_at_idx" ON "resources"("is_published", "is_public", "created_at");

-- Collection: composite index for public collections queries
CREATE INDEX "collections_owner_id_is_public_idx" ON "collections"("owner_id", "is_public");
