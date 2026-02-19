-- CreateTable
CREATE TABLE "review_replies" (
    "id" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "content" TEXT NOT NULL,
    "user_id" VARCHAR(50) NOT NULL,
    "review_id" VARCHAR(50) NOT NULL,

    CONSTRAINT "review_replies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "review_replies_review_id_idx" ON "review_replies"("review_id");

-- AddForeignKey
ALTER TABLE "review_replies" ADD CONSTRAINT "review_replies_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_replies" ADD CONSTRAINT "review_replies_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "resources" ADD COLUMN "tags" JSONB NOT NULL DEFAULT '[]';
