-- Add alt text column for blog main image (improves SEO and accessibility)
ALTER TABLE blogs
ADD COLUMN IF NOT EXISTS main_image_alt TEXT;
