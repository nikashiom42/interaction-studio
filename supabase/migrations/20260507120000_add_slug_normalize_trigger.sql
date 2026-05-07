-- Auto-normalize slug values on insert/update so double dashes, leading/trailing
-- whitespace, casing, and stray characters can never produce dirty URLs again.
-- Mirrors the JS generateSlug() in src/lib/utils.ts.

CREATE OR REPLACE FUNCTION normalize_slug() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NOT NULL THEN
    -- 1. lowercase
    NEW.slug := lower(NEW.slug);
    -- 2. drop anything that isn't alphanumeric, whitespace, or dash
    NEW.slug := regexp_replace(NEW.slug, '[^a-z0-9\s-]', '', 'g');
    -- 3. collapse whitespace runs into a single dash
    NEW.slug := regexp_replace(NEW.slug, '\s+', '-', 'g');
    -- 4. collapse multiple consecutive dashes into one
    NEW.slug := regexp_replace(NEW.slug, '-+', '-', 'g');
    -- 5. strip leading/trailing dashes
    NEW.slug := trim(both '-' from NEW.slug);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS cars_normalize_slug ON cars;
CREATE TRIGGER cars_normalize_slug
  BEFORE INSERT OR UPDATE OF slug ON cars
  FOR EACH ROW EXECUTE FUNCTION normalize_slug();

DROP TRIGGER IF EXISTS tours_normalize_slug ON tours;
CREATE TRIGGER tours_normalize_slug
  BEFORE INSERT OR UPDATE OF slug ON tours
  FOR EACH ROW EXECUTE FUNCTION normalize_slug();

DROP TRIGGER IF EXISTS blogs_normalize_slug ON blogs;
CREATE TRIGGER blogs_normalize_slug
  BEFORE INSERT OR UPDATE OF slug ON blogs
  FOR EACH ROW EXECUTE FUNCTION normalize_slug();
