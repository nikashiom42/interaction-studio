-- Add pickup_time and dropoff_time columns to bookings table
ALTER TABLE public.bookings
ADD COLUMN pickup_time TIME,
ADD COLUMN dropoff_time TIME;

-- Set default times for existing records (optional, can be NULL)
-- UPDATE public.bookings SET pickup_time = '10:00:00', dropoff_time = '10:00:00' WHERE pickup_time IS NULL;
