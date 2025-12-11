-- Create tour category enum
CREATE TYPE public.tour_category AS ENUM ('beach', 'mountains', 'city_tours', 'day_tours', 'adventure', 'cultural', 'wildlife', 'desert');

-- Create tour duration type enum
CREATE TYPE public.tour_duration_type AS ENUM ('fixed', 'flexible');

-- Create tour route type enum  
CREATE TYPE public.tour_route_type AS ENUM ('fixed', 'flexible');

-- Create tours table
CREATE TABLE public.tours (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category tour_category NOT NULL,
  duration_type tour_duration_type NOT NULL DEFAULT 'fixed',
  duration_days INTEGER NOT NULL DEFAULT 1,
  duration_label TEXT, -- e.g., "Full Day", "Half Day"
  main_image TEXT,
  gallery_images TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  
  -- Destinations & Route
  destinations TEXT[] DEFAULT '{}',
  route_type tour_route_type NOT NULL DEFAULT 'fixed',
  route_details TEXT,
  start_location TEXT,
  end_location TEXT,
  
  -- Pricing
  base_price NUMERIC NOT NULL,
  price_per_person BOOLEAN DEFAULT false,
  pricing_tiers JSONB DEFAULT '[]', -- [{min_days: 1, max_days: 3, price: 499}, ...]
  additional_fees JSONB DEFAULT '{}',
  
  -- Included Services
  included_services JSONB DEFAULT '[]', -- ["Professional driver", "Fuel", ...]
  
  -- Availability
  max_participants INTEGER,
  advance_booking_days INTEGER DEFAULT 30,
  
  -- Display
  display_order INTEGER DEFAULT 0,
  meta_title TEXT,
  meta_description TEXT,
  
  -- Stats
  rating NUMERIC DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tour_cars junction table (link tours to cars)
CREATE TABLE public.tour_cars (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tour_id UUID NOT NULL REFERENCES public.tours(id) ON DELETE CASCADE,
  car_id UUID NOT NULL REFERENCES public.cars(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tour_id, car_id)
);

-- Create tour_availability table
CREATE TABLE public.tour_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tour_id UUID NOT NULL REFERENCES public.tours(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  is_available BOOLEAN DEFAULT true,
  reason TEXT,
  UNIQUE(tour_id, date)
);

-- Create tour_itinerary table
CREATE TABLE public.tour_itinerary (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tour_id UUID NOT NULL REFERENCES public.tours(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tour_id, day_number)
);

-- Create tour_highlights table
CREATE TABLE public.tour_highlights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tour_id UUID NOT NULL REFERENCES public.tours(id) ON DELETE CASCADE,
  highlight TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tour_cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tour_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tour_itinerary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tour_highlights ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tours
CREATE POLICY "Anyone can view active tours" ON public.tours
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage all tours" ON public.tours
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for tour_cars
CREATE POLICY "Anyone can view tour cars" ON public.tour_cars
FOR SELECT USING (true);

CREATE POLICY "Admins can manage tour cars" ON public.tour_cars
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for tour_availability
CREATE POLICY "Anyone can view tour availability" ON public.tour_availability
FOR SELECT USING (true);

CREATE POLICY "Admins can manage tour availability" ON public.tour_availability
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for tour_itinerary
CREATE POLICY "Anyone can view tour itinerary" ON public.tour_itinerary
FOR SELECT USING (true);

CREATE POLICY "Admins can manage tour itinerary" ON public.tour_itinerary
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for tour_highlights
CREATE POLICY "Anyone can view tour highlights" ON public.tour_highlights
FOR SELECT USING (true);

CREATE POLICY "Admins can manage tour highlights" ON public.tour_highlights
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_tours_updated_at
BEFORE UPDATE ON public.tours
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for tour images
INSERT INTO storage.buckets (id, name, public) VALUES ('tour-images', 'tour-images', true);

-- Storage policies for tour images
CREATE POLICY "Anyone can view tour images" ON storage.objects
FOR SELECT USING (bucket_id = 'tour-images');

CREATE POLICY "Admins can upload tour images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'tour-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update tour images" ON storage.objects
FOR UPDATE USING (bucket_id = 'tour-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete tour images" ON storage.objects
FOR DELETE USING (bucket_id = 'tour-images' AND has_role(auth.uid(), 'admin'::app_role));