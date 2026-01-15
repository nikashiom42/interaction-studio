-- Add categories array column to cars table for multi-category support
ALTER TABLE cars ADD COLUMN IF NOT EXISTS categories text[] DEFAULT '{}';

-- Migrate existing category data to the new categories array
UPDATE cars SET categories = ARRAY[category::text] WHERE categories = '{}' OR categories IS NULL;
