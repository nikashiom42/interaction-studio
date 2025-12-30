-- Add description and SEO fields to cars table
ALTER TABLE public.cars 
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS meta_title text,
ADD COLUMN IF NOT EXISTS meta_description text;