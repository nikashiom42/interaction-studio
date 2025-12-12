-- Remove engine_volume column from cars table
-- This field is no longer needed per updated requirements

ALTER TABLE cars DROP COLUMN IF EXISTS engine_volume;

-- Note: Mileage was never implemented in the database schema, so no action needed
