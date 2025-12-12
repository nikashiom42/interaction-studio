-- Add tour_id column to bookings table for unified car/tour bookings
ALTER TABLE public.bookings 
ADD COLUMN tour_id uuid REFERENCES public.tours(id) ON DELETE SET NULL;

-- Add constraint to ensure either car_id or tour_id is set (but not both required)
ALTER TABLE public.bookings 
ADD CONSTRAINT bookings_car_or_tour_check 
CHECK (car_id IS NOT NULL OR tour_id IS NOT NULL);

-- Create index for tour bookings queries
CREATE INDEX idx_bookings_tour_id ON public.bookings(tour_id);

-- Add booking_type column to easily identify the type
ALTER TABLE public.bookings 
ADD COLUMN booking_type text DEFAULT 'car' CHECK (booking_type IN ('car', 'tour'));