-- AlterTable
ALTER TABLE "NewsArticle" ADD COLUMN "seoTitle" TEXT;
ALTER TABLE "NewsArticle" ADD COLUMN "seoDescription" TEXT;
ALTER TABLE "NewsArticle" ADD COLUMN "deletedAt" TIMESTAMP(3);
