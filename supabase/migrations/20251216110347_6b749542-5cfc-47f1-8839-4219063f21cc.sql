-- Allow anyone (including unauthenticated users) to create bookings with null user_id
DROP POLICY IF EXISTS "Users can create bookings" ON public.bookings;

-- Policy for authenticated users creating their own bookings
CREATE POLICY "Authenticated users can create own bookings" 
ON public.bookings 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy for guest bookings (unauthenticated users with null user_id)
CREATE POLICY "Anyone can create guest bookings" 
ON public.bookings 
FOR INSERT 
TO anon
WITH CHECK (user_id IS NULL);