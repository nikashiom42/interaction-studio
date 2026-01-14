-- Combined Schema Migration for Car Rental Platform
-- This file contains all schema definitions (no car/tour data)
-- Run this against your new Supabase project

-- ============================================
-- SECTION 1: ENUMS
-- ============================================

-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create car categories enum (updated version)
CREATE TYPE public.car_category AS ENUM (
  'luxury_suv',
  'off_road',
  'suv',
  'jeep',
  'economy_suv',
  'convertible'
);

-- Create transmission enum
CREATE TYPE public.transmission_type AS ENUM ('manual', 'automatic');

-- Create fuel type enum
CREATE TYPE public.fuel_type AS ENUM ('petrol', 'diesel', 'electric', 'hybrid');

-- Create booking status enum
CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled');

-- Create tour category enum
CREATE TYPE public.tour_category AS ENUM ('beach', 'mountains', 'city_tours', 'day_tours', 'adventure', 'cultural', 'wildlife', 'desert');

-- Create tour duration type enum
CREATE TYPE public.tour_duration_type AS ENUM ('fixed', 'flexible');

-- Create tour route type enum
CREATE TYPE public.tour_route_type AS ENUM ('fixed', 'flexible');

-- ============================================
-- SECTION 2: TABLES (must come before functions that reference them)
-- ============================================

-- User roles table (MUST be created first - referenced by has_role function)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Cars table
CREATE TABLE public.cars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    category car_category NOT NULL,
    seats INTEGER NOT NULL DEFAULT 5,
    transmission transmission_type NOT NULL DEFAULT 'automatic',
    fuel_type fuel_type NOT NULL DEFAULT 'petrol',
    price_per_day DECIMAL(10,2) NOT NULL,
    price_with_driver DECIMAL(10,2),
    additional_fees JSONB DEFAULT '{}',
    features JSONB DEFAULT '[]',
    main_image TEXT,
    gallery_images TEXT[] DEFAULT '{}',
    delivery_available BOOLEAN DEFAULT false,
    advance_booking_days INTEGER DEFAULT 30,
    is_active BOOLEAN DEFAULT true,
    rating NUMERIC DEFAULT 0,
    reviews_count INTEGER DEFAULT 0,
    description TEXT,
    meta_title TEXT,
    meta_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Pickup locations table (legacy - per car)
CREATE TABLE public.pickup_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    car_id UUID REFERENCES public.cars(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    working_hours TEXT,
    fee DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Car availability table
CREATE TABLE public.car_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    car_id UUID REFERENCES public.cars(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    is_available BOOLEAN DEFAULT true,
    reason TEXT,
    UNIQUE(car_id, date)
);

-- Tours table
CREATE TABLE public.tours (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category tour_category NOT NULL,
  duration_type tour_duration_type NOT NULL DEFAULT 'fixed',
  duration_days INTEGER NOT NULL DEFAULT 1,
  duration_label TEXT,
  main_image TEXT,
  gallery_images TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  destinations TEXT[] DEFAULT '{}',
  route_type tour_route_type NOT NULL DEFAULT 'fixed',
  route_details TEXT,
  start_location TEXT,
  end_location TEXT,
  base_price NUMERIC NOT NULL,
  price_per_person BOOLEAN DEFAULT false,
  pricing_tiers JSONB DEFAULT '[]',
  additional_fees JSONB DEFAULT '{}',
  included_services JSONB DEFAULT '[]',
  max_participants INTEGER,
  advance_booking_days INTEGER DEFAULT 30,
  display_order INTEGER DEFAULT 0,
  meta_title TEXT,
  meta_description TEXT,
  rating NUMERIC DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tour cars junction table
CREATE TABLE public.tour_cars (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tour_id UUID NOT NULL REFERENCES public.tours(id) ON DELETE CASCADE,
  car_id UUID NOT NULL REFERENCES public.cars(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tour_id, car_id)
);

-- Tour availability table
CREATE TABLE public.tour_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tour_id UUID NOT NULL REFERENCES public.tours(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  is_available BOOLEAN DEFAULT true,
  reason TEXT,
  UNIQUE(tour_id, date)
);

-- Tour itinerary table
CREATE TABLE public.tour_itinerary (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tour_id UUID NOT NULL REFERENCES public.tours(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tour_id, day_number)
);

-- Tour highlights table
CREATE TABLE public.tour_highlights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tour_id UUID NOT NULL REFERENCES public.tours(id) ON DELETE CASCADE,
  highlight TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Bookings table (unified for cars and tours)
CREATE TABLE public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    car_id UUID REFERENCES public.cars(id) ON DELETE SET NULL,
    tour_id UUID REFERENCES public.tours(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    pickup_location_id UUID REFERENCES public.pickup_locations(id) ON DELETE SET NULL,
    dropoff_location_id UUID REFERENCES public.pickup_locations(id) ON DELETE SET NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    with_driver BOOLEAN DEFAULT false,
    total_price DECIMAL(10,2) NOT NULL,
    status booking_status NOT NULL DEFAULT 'pending',
    booking_type TEXT DEFAULT 'car' CHECK (booking_type IN ('car', 'tour')),
    customer_name TEXT,
    customer_email TEXT,
    customer_phone TEXT,
    notes TEXT,
    payment_status TEXT DEFAULT 'pending',
    payment_option TEXT DEFAULT 'full',
    deposit_amount DECIMAL(10,2) DEFAULT 0,
    remaining_balance DECIMAL(10,2) DEFAULT 0,
    payment_transaction_id TEXT,
    payment_date TIMESTAMP WITH TIME ZONE,
    confirmation_date TIMESTAMP WITH TIME ZONE,
    admin_notes TEXT,
    passengers INTEGER DEFAULT 1,
    pickup_time TIME,
    dropoff_time TIME,
    pickup_details TEXT,
    child_seats INTEGER DEFAULT 0,
    child_seats_total NUMERIC DEFAULT 0,
    camping_equipment BOOLEAN DEFAULT false,
    camping_equipment_total NUMERIC DEFAULT 0,
    addons_total NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT bookings_car_or_tour_check CHECK (car_id IS NOT NULL OR tour_id IS NOT NULL)
);

-- Reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  car_id UUID REFERENCES public.cars(id) ON DELETE CASCADE,
  tour_id UUID REFERENCES public.tours(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  content TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT review_target_check CHECK (
    (car_id IS NOT NULL AND tour_id IS NULL) OR
    (car_id IS NULL AND tour_id IS NOT NULL)
  )
);
COMMENT ON TABLE public.reviews IS 'Reviews feature is currently disabled. INSERT operations are blocked. Existing reviews are kept for reference only.';

-- Contact messages table
CREATE TABLE public.contact_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Blogs table
CREATE TABLE public.blogs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  main_image TEXT,
  author_name TEXT DEFAULT 'Admin',
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- FAQs table
CREATE TABLE IF NOT EXISTS public.faqs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Locations table (global pickup/delivery locations)
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

-- Settings table
CREATE TABLE IF NOT EXISTS public.settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- SECTION 3: FUNCTIONS (after tables they reference)
-- ============================================

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Function to update car ratings based on reviews
CREATE OR REPLACE FUNCTION public.update_car_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_car_id uuid;
BEGIN
  -- Determine which car_id to update
  IF TG_OP = 'DELETE' THEN
    target_car_id := OLD.car_id;
  ELSE
    target_car_id := NEW.car_id;
  END IF;

  -- Update car rating
  IF target_car_id IS NOT NULL THEN
    UPDATE public.cars
    SET
      rating = COALESCE((SELECT AVG(rating) FROM public.reviews WHERE car_id = target_car_id AND is_approved = true), 0),
      reviews_count = (SELECT COUNT(*) FROM public.reviews WHERE car_id = target_car_id AND is_approved = true)
    WHERE id = target_car_id;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- Function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data ->> 'full_name');

  -- Auto-assign user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'user');

  RETURN new;
END;
$$;

-- ============================================
-- SECTION 4: INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON public.bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_bookings_start_date ON public.bookings(start_date);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_email ON public.bookings(customer_email);
CREATE INDEX IF NOT EXISTS idx_bookings_tour_id ON public.bookings(tour_id);
CREATE INDEX idx_reviews_car_id ON public.reviews(car_id) WHERE car_id IS NOT NULL;
CREATE INDEX idx_reviews_tour_id ON public.reviews(tour_id) WHERE tour_id IS NOT NULL;
CREATE INDEX idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX idx_reviews_is_featured ON public.reviews(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS faqs_display_order_idx ON public.faqs(display_order);
CREATE INDEX IF NOT EXISTS faqs_is_active_idx ON public.faqs(is_active);
CREATE INDEX IF NOT EXISTS locations_display_order_idx ON public.locations(display_order);
CREATE INDEX IF NOT EXISTS locations_is_active_idx ON public.locations(is_active);

-- ============================================
-- SECTION 5: ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pickup_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.car_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tour_cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tour_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tour_itinerary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tour_highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- SECTION 6: RLS POLICIES
-- ============================================

-- User roles policies
CREATE POLICY "Admins can manage all roles" ON public.user_roles
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own roles" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id);

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all profiles" ON public.profiles
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Cars policies
CREATE POLICY "Anyone can view active cars" ON public.cars
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage all cars" ON public.cars
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Pickup locations policies
CREATE POLICY "Anyone can view pickup locations" ON public.pickup_locations
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage pickup locations" ON public.pickup_locations
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Car availability policies
CREATE POLICY "Anyone can view availability" ON public.car_availability
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage availability" ON public.car_availability
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Tours policies
CREATE POLICY "Anyone can view active tours" ON public.tours
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage all tours" ON public.tours
FOR ALL USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Tour cars policies
CREATE POLICY "Anyone can view tour cars" ON public.tour_cars
FOR SELECT USING (true);

CREATE POLICY "Admins can manage tour cars" ON public.tour_cars
FOR ALL USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Tour availability policies
CREATE POLICY "Anyone can view tour availability" ON public.tour_availability
FOR SELECT USING (true);

CREATE POLICY "Admins can manage tour availability" ON public.tour_availability
FOR ALL USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Tour itinerary policies
CREATE POLICY "Anyone can view tour itinerary" ON public.tour_itinerary
FOR SELECT USING (true);

CREATE POLICY "Admins can manage tour itinerary" ON public.tour_itinerary
FOR ALL USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Tour highlights policies
CREATE POLICY "Anyone can view tour highlights" ON public.tour_highlights
FOR SELECT USING (true);

CREATE POLICY "Admins can manage tour highlights" ON public.tour_highlights
FOR ALL USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Bookings policies
CREATE POLICY "Allow viewing own and guest bookings" ON public.bookings
    FOR SELECT
    USING (
        (auth.uid() = user_id)
        OR (user_id IS NULL)
        OR public.has_role(auth.uid(), 'admin')
    );

CREATE POLICY "Authenticated users can create own bookings"
ON public.bookings
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can create guest bookings"
ON public.bookings
AS PERMISSIVE
FOR INSERT
TO public
WITH CHECK (user_id IS NULL);

CREATE POLICY "Admins can manage all bookings"
ON public.bookings
AS PERMISSIVE
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Reviews policies
CREATE POLICY "Anyone can view approved reviews"
ON public.reviews
FOR SELECT
USING (is_approved = true);

CREATE POLICY "Users can update own reviews"
ON public.reviews
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
ON public.reviews
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all reviews"
ON public.reviews
FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Reviews creation disabled (feature disabled)
CREATE POLICY "Reviews creation disabled" ON public.reviews
  FOR INSERT
  WITH CHECK (false);

-- Contact messages policies
CREATE POLICY "Anyone can submit contact messages"
ON public.contact_messages
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Admins can manage contact messages"
ON public.contact_messages
FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Blogs policies
CREATE POLICY "Anyone can view published blogs"
ON public.blogs
FOR SELECT
USING (is_published = true);

CREATE POLICY "Admins can manage all blogs"
ON public.blogs
FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- FAQs policies
CREATE POLICY "Allow public read access to active FAQs"
  ON public.faqs
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Allow authenticated users to insert FAQs"
  ON public.faqs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update FAQs"
  ON public.faqs
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete FAQs"
  ON public.faqs
  FOR DELETE
  TO authenticated
  USING (true);

-- Locations policies
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

-- Settings policies
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

-- ============================================
-- SECTION 7: TRIGGERS
-- ============================================

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cars_updated_at
  BEFORE UPDATE ON public.cars
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tours_updated_at
BEFORE UPDATE ON public.tours
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
BEFORE UPDATE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blogs_updated_at
BEFORE UPDATE ON public.blogs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Triggers for car ratings
CREATE TRIGGER trigger_update_car_rating_insert_update
AFTER INSERT OR UPDATE ON public.reviews
FOR EACH ROW
WHEN (NEW.car_id IS NOT NULL)
EXECUTE FUNCTION public.update_car_rating();

CREATE TRIGGER trigger_update_car_rating_delete
AFTER DELETE ON public.reviews
FOR EACH ROW
WHEN (OLD.car_id IS NOT NULL)
EXECUTE FUNCTION public.update_car_rating();

-- ============================================
-- SECTION 8: STORAGE BUCKETS
-- ============================================

-- Create storage bucket for car images
INSERT INTO storage.buckets (id, name, public)
VALUES ('car-images', 'car-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for tour images
INSERT INTO storage.buckets (id, name, public)
VALUES ('tour-images', 'tour-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for car images
CREATE POLICY "Anyone can view car images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'car-images');

CREATE POLICY "Admins can upload car images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'car-images'
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can update car images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'car-images'
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Admins can delete car images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'car-images'
  AND public.has_role(auth.uid(), 'admin')
);

-- Storage policies for tour images
CREATE POLICY "Anyone can view tour images" ON storage.objects
FOR SELECT USING (bucket_id = 'tour-images');

CREATE POLICY "Admins can upload tour images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'tour-images' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update tour images" ON storage.objects
FOR UPDATE USING (bucket_id = 'tour-images' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete tour images" ON storage.objects
FOR DELETE USING (bucket_id = 'tour-images' AND public.has_role(auth.uid(), 'admin'::app_role));

-- ============================================
-- SECTION 9: SEED DATA (Configuration only - no cars/tours)
-- ============================================

-- Insert default FAQs
INSERT INTO public.faqs (question, answer, display_order, is_active) VALUES
  ('What documents do I need to rent a car in Georgia?', 'You need a valid driving license (international or from your home country), a passport or ID, and a credit/debit card for the deposit. Drivers must be at least 21 years old with at least 1 year of driving experience.', 1, true),
  ('Is insurance included in the rental price?', 'Yes, basic insurance (CDW - Collision Damage Waiver) is included in all our rentals. You can upgrade to full coverage insurance for additional peace of mind at checkout.', 2, true),
  ('Can I pick up the car at Tbilisi Airport?', 'Absolutely! We offer convenient pickup and drop-off at Tbilisi International Airport (TBS), as well as Batumi and Kutaisi airports. Airport pickup is available 24/7.', 3, true),
  ('What is your cancellation policy?', 'Free cancellation up to 48 hours before your pickup time for a full refund. Cancellations within 48 hours may be subject to a cancellation fee of one day''s rental.', 4, true),
  ('Do you offer one-way rentals?', 'Yes, we offer one-way rentals between major cities in Georgia. Pick up in Tbilisi and drop off in Batumi, or vice versa. Additional fees may apply for one-way rentals.', 5, true),
  ('What fuel policy do you have?', 'We operate a "full-to-full" fuel policy. You receive the car with a full tank and should return it with a full tank. Fuel costs are not included in the rental price.', 6, true);

-- Insert default locations
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

-- ============================================
-- END OF SCHEMA MIGRATION
-- ============================================
