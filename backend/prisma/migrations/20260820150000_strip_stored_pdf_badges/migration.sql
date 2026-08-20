-- Remove legacy derived pdf badge from stored product badges
UPDATE "Product"
SET "badges" = array_remove("badges", 'pdf')
WHERE 'pdf' = ANY("badges");
