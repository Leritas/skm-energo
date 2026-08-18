-- AlterTable
ALTER TABLE "Product" ADD COLUMN "seoTitle" TEXT;
ALTER TABLE "Product" ADD COLUMN "seoDescription" TEXT;
ALTER TABLE "Product" ADD COLUMN "isPublished" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Product" ADD COLUMN "deletedAt" TIMESTAMP(3);
