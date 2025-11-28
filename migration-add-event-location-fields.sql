-- Add Google Maps fields to events table for location geocoding
ALTER TABLE events
ADD COLUMN IF NOT EXISTS location_latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS location_longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS google_place_id TEXT;

-- Add comments for clarity
COMMENT ON COLUMN events.location IS 'Venue name or address as displayed to customers';
COMMENT ON COLUMN events.location_latitude IS 'Latitude coordinate for Google Maps display';
COMMENT ON COLUMN events.location_longitude IS 'Longitude coordinate for Google Maps display';
COMMENT ON COLUMN events.google_place_id IS 'Google Places API place ID for reference';
