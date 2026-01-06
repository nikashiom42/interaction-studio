-- Disable Reviews Feature
-- This migration disables the ability to create new reviews
-- while keeping existing reviews readable (for admin reference)

-- Drop the existing INSERT policy for reviews
DROP POLICY IF EXISTS "Users can create reviews" ON public.reviews;
DROP POLICY IF EXISTS "Anyone can create reviews" ON public.reviews;
DROP POLICY IF EXISTS "Allow authenticated users to create reviews" ON public.reviews;

-- Create a new INSERT policy that denies all inserts
-- This effectively disables review creation
CREATE POLICY "Reviews creation disabled" ON public.reviews
  FOR INSERT
  WITH CHECK (false);

-- Keep SELECT policy for admins to view existing reviews
-- (existing SELECT policies should remain unchanged)

-- Add a comment to the table documenting the disabled state
COMMENT ON TABLE public.reviews IS 'Reviews feature is currently disabled. INSERT operations are blocked. Existing reviews are kept for reference only.';
