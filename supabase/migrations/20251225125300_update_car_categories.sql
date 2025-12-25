-- Update car_category enum to match new requirements
-- New categories: luxury_suv, off_road, suv, jeep, economy_suv, convertible

-- First, create the new enum type
CREATE TYPE public.car_category_new AS ENUM (
  'luxury_suv',
  'off_road',
  'suv',
  'jeep',
  'economy_suv',
  'convertible'
);

-- Alter the cars table to use the new enum
-- This is done in steps to migrate existing data safely

-- Add a temporary column with the new type
ALTER TABLE public.cars ADD COLUMN category_new car_category_new;

-- Migrate existing data to closest matching new categories
UPDATE public.cars SET category_new =
  CASE
    WHEN category = 'luxury' THEN 'luxury_suv'::car_category_new
    WHEN category = 'suv' THEN 'suv'::car_category_new
    WHEN category = 'economy' THEN 'economy_suv'::car_category_new
    WHEN category = 'convertible' THEN 'convertible'::car_category_new
    WHEN category = 'sports' THEN 'luxury_suv'::car_category_new
    WHEN category = 'electric' THEN 'luxury_suv'::car_category_new
    WHEN category = 'minivan' THEN 'suv'::car_category_new
    ELSE 'suv'::car_category_new
  END;

-- Drop the old category column
ALTER TABLE public.cars DROP COLUMN category;

-- Rename the new column to category
ALTER TABLE public.cars RENAME COLUMN category_new TO category;

-- Make the column NOT NULL
ALTER TABLE public.cars ALTER COLUMN category SET NOT NULL;

-- Drop the old enum type
DROP TYPE public.car_category;

-- Rename the new enum type to the original name
ALTER TYPE public.car_category_new RENAME TO car_category;
