-- Add add-ons columns to bookings table
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS child_seats INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS child_seats_total NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS camping_equipment BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS camping_equipment_total NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS addons_total NUMERIC DEFAULT 0;

-- Add comments for documentation
COMMENT ON COLUMN public.bookings.child_seats IS 'Number of child seats requested (0-4)';
COMMENT ON COLUMN public.bookings.child_seats_total IS 'Total cost for child seats';
COMMENT ON COLUMN public.bookings.camping_equipment IS 'Whether camping equipment for 2 people is requested';
COMMENT ON COLUMN public.bookings.camping_equipment_total IS 'Total cost for camping equipment';
COMMENT ON COLUMN public.bookings.addons_total IS 'Combined total of all add-ons';