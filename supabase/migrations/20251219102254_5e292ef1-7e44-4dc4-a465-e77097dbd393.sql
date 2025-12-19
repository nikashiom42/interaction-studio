-- Add missing columns to cars table for ratings
ALTER TABLE public.cars 
ADD COLUMN IF NOT EXISTS rating NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS reviews_count INTEGER DEFAULT 0;

-- Ensure pickup_time and dropoff_time exist in bookings (may already exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'bookings' AND column_name = 'pickup_time') THEN
    ALTER TABLE public.bookings ADD COLUMN pickup_time TIME;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'bookings' AND column_name = 'dropoff_time') THEN
    ALTER TABLE public.bookings ADD COLUMN dropoff_time TIME;
  END IF;
END $$;