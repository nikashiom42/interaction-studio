-- Drop the broken trigger and function that references non-existent 'sports' category
DROP TRIGGER IF EXISTS check_sport_car_overlap_trigger ON bookings;
DROP FUNCTION IF EXISTS check_sport_car_booking_overlap();
