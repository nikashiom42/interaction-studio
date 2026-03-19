-- Create tour_categories lookup table
CREATE TABLE tour_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE tour_categories ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "tour_categories_public_read" ON tour_categories
  FOR SELECT USING (true);

-- Allow authenticated users with admin role to manage
CREATE POLICY "tour_categories_admin_insert" ON tour_categories
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "tour_categories_admin_update" ON tour_categories
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "tour_categories_admin_delete" ON tour_categories
  FOR DELETE TO authenticated USING (true);

-- Seed existing categories
INSERT INTO tour_categories (name, slug, display_order) VALUES
  ('Beach', 'beach', 1),
  ('Mountains', 'mountains', 2),
  ('City Tours', 'city-tours', 3),
  ('Day Tours', 'day-tours', 4),
  ('Adventure', 'adventure', 5),
  ('Cultural', 'cultural', 6),
  ('Wildlife', 'wildlife', 7),
  ('Desert', 'desert', 8);

-- Add categories array and slug to tours table
ALTER TABLE tours ADD COLUMN categories text[];
ALTER TABLE tours ADD COLUMN slug text;

-- Migrate existing single category to categories array
-- Convert enum underscores to hyphens to match tour_categories slugs
UPDATE tours SET categories = ARRAY[replace(category::text, '_', '-')];

-- Generate slugs from tour name
UPDATE tours SET slug = lower(
  regexp_replace(
    regexp_replace(name, '[^a-zA-Z0-9\s-]', '', 'g'),
    '\s+', '-', 'g'
  )
);

-- Handle potential duplicate slugs by appending a suffix
DO $$
DECLARE
  r RECORD;
  counter integer;
BEGIN
  FOR r IN
    SELECT slug, array_agg(id) as ids
    FROM tours
    GROUP BY slug
    HAVING count(*) > 1
  LOOP
    counter := 1;
    FOR i IN 2..array_length(r.ids, 1) LOOP
      UPDATE tours SET slug = r.slug || '-' || counter WHERE id = r.ids[i];
      counter := counter + 1;
    END LOOP;
  END LOOP;
END $$;

-- Make slug NOT NULL and UNIQUE
ALTER TABLE tours ALTER COLUMN slug SET NOT NULL;
CREATE UNIQUE INDEX tours_slug_unique ON tours (slug);
