-- Fix RLS: admin policy on bookings was created as RESTRICTIVE, which blocks guest inserts.
-- Recreate it as PERMISSIVE (default) so it grants access without AND-ing with other insert policies.

DROP POLICY IF EXISTS "Admins can manage all bookings" ON public.bookings;

CREATE POLICY "Admins can manage all bookings"
ON public.bookings
AS PERMISSIVE
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
