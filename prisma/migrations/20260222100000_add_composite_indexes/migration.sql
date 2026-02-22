-- Add composite and missing indexes for query performance

-- Bundle: composite index for seller's published bundles
CREATE INDEX "bundles_seller_id_is_published_idx" ON "bundles"("seller_id", "is_published");

-- Report: indexes for admin queries
CREATE INDEX "reports_reported_user_id_idx" ON "reports"("reported_user_id");
CREATE INDEX "reports_resource_id_idx" ON "reports"("resource_id");
CREATE INDEX "reports_handled_by_id_idx" ON "reports"("handled_by_id");

-- Resource: composite index for marketplace listing queries
CREATE INDEX "resources_seller_id_is_published_is_public_idx" ON "resources"("seller_id", "is_published", "is_public");

-- Transaction: unique constraint on Stripe session ID and composite index
CREATE UNIQUE INDEX "transactions_stripe_checkout_session_id_key" ON "transactions"("stripe_checkout_session_id");
CREATE INDEX "transactions_buyer_id_status_created_at_idx" ON "transactions"("buyer_id", "status", "created_at");
