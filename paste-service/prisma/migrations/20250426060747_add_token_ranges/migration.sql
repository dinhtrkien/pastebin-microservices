-- CreateTable
CREATE TABLE "TokenRange" (
    "id" BIGSERIAL NOT NULL,
    "range_start" BIGINT NOT NULL,
    "range_end" BIGINT NOT NULL,
    "next_value" BIGINT NOT NULL,
    "leased_by" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TokenRange_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TokenRange_range_start_range_end_key" ON "TokenRange"("range_start", "range_end");
