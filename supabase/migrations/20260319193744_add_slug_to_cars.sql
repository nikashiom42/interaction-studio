-- Add slug column to cars table
ALTER TABLE cars ADD COLUMN slug text;

-- Generate slugs from existing brand + model
UPDATE cars SET slug = lower(
  regexp_replace(
    regexp_replace(brand || '-' || model, '[^a-zA-Z0-9\s-]', '', 'g'),
    '\s+', '-', 'g'
  )
);

-- Make slug NOT NULL and UNIQUE after populating
ALTER TABLE cars ALTER COLUMN slug SET NOT NULL;
CREATE UNIQUE INDEX cars_slug_unique ON cars (slug);
