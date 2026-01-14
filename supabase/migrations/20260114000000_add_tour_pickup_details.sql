-- Add pickup_details column for tour bookings
-- This stores the pickup city and address as text (e.g., "Tbilisi - Marriott Hotel")
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS pickup_details TEXT;

-- Add comment for documentation
COMMENT ON COLUMN bookings.pickup_details IS 'Free-text pickup location for tour bookings (city and hotel/address)';
