-- Drop legacy pdfHref column from Product
ALTER TABLE "Product" DROP COLUMN IF EXISTS "pdfHref";
