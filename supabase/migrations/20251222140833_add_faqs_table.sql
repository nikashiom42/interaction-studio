-- Create FAQs table
CREATE TABLE IF NOT EXISTS public.faqs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index on display_order for faster sorting
CREATE INDEX IF NOT EXISTS faqs_display_order_idx ON public.faqs(display_order);

-- Create index on is_active for filtering
CREATE INDEX IF NOT EXISTS faqs_is_active_idx ON public.faqs(is_active);

-- Enable Row Level Security
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access to active FAQs
CREATE POLICY "Allow public read access to active FAQs"
  ON public.faqs
  FOR SELECT
  USING (is_active = true);

-- Create policy to allow authenticated users to manage FAQs
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

-- Insert default FAQs from the component
INSERT INTO public.faqs (question, answer, display_order, is_active) VALUES
  ('What documents do I need to rent a car in Georgia?', 'You need a valid driving license (international or from your home country), a passport or ID, and a credit/debit card for the deposit. Drivers must be at least 21 years old with at least 1 year of driving experience.', 1, true),
  ('Is insurance included in the rental price?', 'Yes, basic insurance (CDW - Collision Damage Waiver) is included in all our rentals. You can upgrade to full coverage insurance for additional peace of mind at checkout.', 2, true),
  ('Can I pick up the car at Tbilisi Airport?', 'Absolutely! We offer convenient pickup and drop-off at Tbilisi International Airport (TBS), as well as Batumi and Kutaisi airports. Airport pickup is available 24/7.', 3, true),
  ('What is your cancellation policy?', 'Free cancellation up to 48 hours before your pickup time for a full refund. Cancellations within 48 hours may be subject to a cancellation fee of one day''s rental.', 4, true),
  ('Do you offer one-way rentals?', 'Yes, we offer one-way rentals between major cities in Georgia. Pick up in Tbilisi and drop off in Batumi, or vice versa. Additional fees may apply for one-way rentals.', 5, true),
  ('What fuel policy do you have?', 'We operate a "full-to-full" fuel policy. You receive the car with a full tank and should return it with a full tank. Fuel costs are not included in the rental price.', 6, true);