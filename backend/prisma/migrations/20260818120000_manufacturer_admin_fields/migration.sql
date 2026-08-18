-- AlterTable
ALTER TABLE "Manufacturer" ADD COLUMN "isPublished" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Manufacturer" ADD COLUMN "deletedAt" TIMESTAMP(3);
