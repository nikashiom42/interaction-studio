-- Fix guest checkout: admin policy must be PERMISSIVE so it doesn't block guest inserts
DROP POLICY IF EXISTS "Admins can manage all bookings" ON public.bookings;

CREATE POLICY "Admins can manage all bookings"
ON public.bookings
AS PERMISSIVE
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
