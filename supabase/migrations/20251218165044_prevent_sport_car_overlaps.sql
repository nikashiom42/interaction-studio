-- Function to check for overlapping bookings (only for sport cars)
CREATE OR REPLACE FUNCTION check_sport_car_booking_overlap()
RETURNS TRIGGER AS $$
DECLARE
  car_category car_category;
  overlap_count INTEGER;
BEGIN
  -- Only check if this is a car booking (not a tour)
  IF NEW.car_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Get the car's category
  SELECT category INTO car_category
  FROM cars
  WHERE id = NEW.car_id;

  -- Only prevent overlaps for sport cars
  IF car_category = 'sports' THEN
    -- Check for overlapping bookings for the same car
    SELECT COUNT(*) INTO overlap_count
    FROM bookings
    WHERE car_id = NEW.car_id
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
      AND status NOT IN ('cancelled', 'completed')
      AND (
        -- Check if date ranges overlap
        (start_date <= NEW.end_date AND end_date >= NEW.start_date)
      );

    -- If there's an overlap, raise an exception
    IF overlap_count > 0 THEN
      RAISE EXCEPTION 'This sport car is not available for the selected dates. Sport cars can only have one booking at a time. Please choose different dates.';
    END IF;
  END IF;

  -- For all other categories, allow overlapping bookings
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to run before insert or update
DROP TRIGGER IF EXISTS check_sport_car_overlap_trigger ON bookings;
CREATE TRIGGER check_sport_car_overlap_trigger
  BEFORE INSERT OR UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION check_sport_car_booking_overlap();

-- Add a comment to document the behavior
COMMENT ON FUNCTION check_sport_car_booking_overlap() IS
'Prevents overlapping bookings for sport cars only. All other car categories allow multiple concurrent bookings.';
