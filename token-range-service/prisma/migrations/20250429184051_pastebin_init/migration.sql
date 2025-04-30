-- CreateTable
CREATE TABLE "Analytics" (
    "id" SERIAL NOT NULL,
    "dateBucket" TIMESTAMP(3) NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "pasteId" INTEGER NOT NULL,

    CONSTRAINT "Analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Paste" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expirationTime" TIMESTAMP(3),
    "viewsCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Paste_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Analytics_pasteId_dateBucket_key" ON "Analytics"("pasteId", "dateBucket");

-- CreateIndex
CREATE UNIQUE INDEX "Paste_slug_key" ON "Paste"("slug");

-- AddForeignKey
ALTER TABLE "Analytics" ADD CONSTRAINT "Analytics_pasteId_fkey" FOREIGN KEY ("pasteId") REFERENCES "Paste"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
