-- Add canonical_url column to cars, tours, and blogs so admin can override
-- the auto-generated self-referencing canonical when needed (e.g. for
-- syndicated content or migrated URLs).

ALTER TABLE cars  ADD COLUMN IF NOT EXISTS canonical_url TEXT;
ALTER TABLE tours ADD COLUMN IF NOT EXISTS canonical_url TEXT;
ALTER TABLE blogs ADD COLUMN IF NOT EXISTS canonical_url TEXT;
