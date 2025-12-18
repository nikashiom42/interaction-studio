-- Fix guest checkout RLS: INSERT policies were RESTRICTIVE, which forces ALL INSERT policies to pass (guest + authenticated), blocking anon inserts.

DO $$ BEGIN
  -- Guest insert policy
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'bookings' AND policyname = 'Anyone can create guest bookings'
  ) THEN
    EXECUTE 'DROP POLICY "Anyone can create guest bookings" ON public.bookings';
  END IF;

  EXECUTE $sql$
    CREATE POLICY "Anyone can create guest bookings"
    ON public.bookings
    AS PERMISSIVE
    FOR INSERT
    TO public
    WITH CHECK (user_id IS NULL)
  $sql$;

  -- Authenticated insert policy
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'bookings' AND policyname = 'Authenticated users can create own bookings'
  ) THEN
    EXECUTE 'DROP POLICY "Authenticated users can create own bookings" ON public.bookings';
  END IF;

  EXECUTE $sql$
    CREATE POLICY "Authenticated users can create own bookings"
    ON public.bookings
    AS PERMISSIVE
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id)
  $sql$;
END $$;