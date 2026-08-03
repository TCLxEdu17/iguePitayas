-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ActivityType" ADD VALUE 'ADUBACAO';
ALTER TYPE "ActivityType" ADD VALUE 'DESFOLHA';
ALTER TYPE "ActivityType" ADD VALUE 'DESBASTE';
ALTER TYPE "ActivityType" ADD VALUE 'ENSACAMENTO';
ALTER TYPE "ActivityType" ADD VALUE 'ESCORA';
ALTER TYPE "ActivityType" ADD VALUE 'IRRIGACAO';
ALTER TYPE "ActivityType" ADD VALUE 'PLANTIO';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Unit" ADD VALUE 'KG';
ALTER TYPE "Unit" ADD VALUE 'CACHO';
ALTER TYPE "Unit" ADD VALUE 'PENCA';
ALTER TYPE "Unit" ADD VALUE 'DUZIA';
ALTER TYPE "Unit" ADD VALUE 'SACO';
ALTER TYPE "Unit" ADD VALUE 'TONELADA';

-- AlterTable
ALTER TABLE "Harvest" ADD COLUMN     "productType" "ProductType";

-- CreateTable
CREATE TABLE "ProductPrice" (
    "id" TEXT NOT NULL,
    "productType" "ProductType" NOT NULL,
    "unit" "Unit" NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductPrice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductPrice_productType_unit_key" ON "ProductPrice"("productType", "unit");
