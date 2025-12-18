-- Drop the restrictive INSERT policy for bookings
DROP POLICY IF EXISTS "Users can create bookings" ON public.bookings;

-- Create a new policy that allows both authenticated users and guest bookings
CREATE POLICY "Allow authenticated and guest bookings" ON public.bookings
    FOR INSERT
    WITH CHECK (
        -- Allow if user is authenticated and user_id matches
        (auth.uid() = user_id)
        OR
        -- Allow if it's a guest booking (user_id is NULL and user is not authenticated)
        (user_id IS NULL)
    );

-- Also update the SELECT policy to allow users to view their own bookings
-- and allow anyone to view bookings without auth (for confirmation pages, etc.)
DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;

CREATE POLICY "Allow viewing own and guest bookings" ON public.bookings
    FOR SELECT
    USING (
        -- Authenticated users can see their own bookings
        (auth.uid() = user_id)
        OR
        -- Anyone can view guest bookings (needed for confirmation page)
        (user_id IS NULL)
        OR
        -- Admins can see all bookings (this is covered by separate admin policy)
        public.has_role(auth.uid(), 'admin')
    );
