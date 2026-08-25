-- CreateEnum
CREATE TYPE "CustomerType" AS ENUM ('individual', 'legal_entity');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN "customerType" "CustomerType" NOT NULL DEFAULT 'individual';
