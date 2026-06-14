-- CreateTable
CREATE TABLE "love_taps" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    "count" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "love_taps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "image_snaps" (
    "id" TEXT NOT NULL,
    "s3Key" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT,

    CONSTRAINT "image_snaps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "love_taps_timestamp_idx" ON "love_taps"("timestamp");

-- CreateIndex
CREATE INDEX "image_snaps_uploadedAt_idx" ON "image_snaps"("uploadedAt");
