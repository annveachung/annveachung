-- DropTable
DROP TABLE "MapNode";

-- CreateTable
CREATE TABLE "VisitedCountry" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "VisitedCountry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VisitedCountry_code_key" ON "VisitedCountry"("code");

