-- Create locations table to store pickup/delivery locations with fees
CREATE TABLE IF NOT EXISTS public.locations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  delivery_fee DECIMAL(10, 2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create settings table for configurable prices and settings
CREATE TABLE IF NOT EXISTS public.settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Create policies for locations (public read, authenticated write)
CREATE POLICY "Allow public read access to active locations"
  ON public.locations
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Allow authenticated users to manage locations"
  ON public.locations
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policies for settings (public read, authenticated write)
CREATE POLICY "Allow public read access to settings"
  ON public.settings
  FOR SELECT
  USING (true);

CREATE POLICY "Allow authenticated users to manage settings"
  ON public.settings
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert default locations from the hardcoded array
INSERT INTO public.locations (id, name, city, lat, lng, delivery_fee, display_order, is_active) VALUES
  ('tbs', 'Tbilisi Airport (TBS)', 'Tbilisi', 41.6692, 44.9547, 0, 1, true),
  ('tbilisi-center', 'Tbilisi City Center', 'Tbilisi', 41.7151, 44.8271, 0, 2, true),
  ('batumi', 'Batumi Airport', 'Batumi', 41.6103, 41.5997, 30, 3, true),
  ('batumi-center', 'Batumi City Center', 'Batumi', 41.6168, 41.6367, 30, 4, true),
  ('kutaisi', 'Kutaisi Airport', 'Kutaisi', 42.1766, 42.4822, 30, 5, true),
  ('gudauri', 'Gudauri Ski Resort', 'Gudauri', 42.4789, 44.4706, 30, 6, true),
  ('bakuriani', 'Bakuriani Ski Resort', 'Bakuriani', 41.7497, 43.5325, 30, 7, true),
  ('kazbegi', 'Kazbegi (Stepantsminda)', 'Kazbegi', 42.6598, 44.6420, 30, 8, true),
  ('mestia', 'Mestia', 'Mestia', 43.0444, 42.7289, 30, 9, true);

-- Insert addon pricing settings
INSERT INTO public.settings (key, value, description) VALUES
  ('addon_pricing', '{
    "childSeat": {
      "pricePerDay": 3,
      "maxQuantity": 4,
      "label": "Child Seat"
    },
    "campingEquipment": {
      "pricePerDay": 10,
      "label": "Camping Equipment (for 2 people)"
    }
  }', 'Pricing configuration for booking add-ons like child seats and camping equipment');

-- Create indexes
CREATE INDEX IF NOT EXISTS locations_display_order_idx ON public.locations(display_order);
CREATE INDEX IF NOT EXISTS locations_is_active_idx ON public.locations(is_active);