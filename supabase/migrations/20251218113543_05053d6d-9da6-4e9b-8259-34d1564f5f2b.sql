-- Ensure guest checkout works for any unauthenticated request role by broadening policy role scope
DROP POLICY IF EXISTS "Anyone can create guest bookings" ON public.bookings;

CREATE POLICY "Anyone can create guest bookings"
ON public.bookings
AS PERMISSIVE
FOR INSERT
TO public
WITH CHECK (user_id IS NULL);
