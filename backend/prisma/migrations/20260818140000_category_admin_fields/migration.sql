-- AlterTable
ALTER TABLE "Category" ADD COLUMN "seoTitle" TEXT;
ALTER TABLE "Category" ADD COLUMN "seoDescription" TEXT;
ALTER TABLE "Category" ADD COLUMN "isPublished" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Category" ADD COLUMN "deletedAt" TIMESTAMP(3);
