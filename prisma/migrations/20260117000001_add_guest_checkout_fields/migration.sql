-- Guest Checkout Support Migration
-- Allows transactions without a registered user (guest checkout)

-- Add guest_email column for guest purchases
ALTER TABLE "transactions" ADD COLUMN "guest_email" TEXT;

-- Make buyer_id optional (nullable) for guest checkout
ALTER TABLE "transactions" ALTER COLUMN "buyer_id" DROP NOT NULL;
