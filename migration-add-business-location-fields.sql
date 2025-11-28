-- Add Google Maps fields to businesses table for address geocoding
ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS address_latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS address_longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS google_place_id TEXT;

-- Add comments for clarity
COMMENT ON COLUMN businesses.address IS 'Full formatted address as entered by business';
COMMENT ON COLUMN businesses.address_latitude IS 'Latitude coordinate for Google Maps display';
COMMENT ON COLUMN businesses.address_longitude IS 'Longitude coordinate for Google Maps display';
COMMENT ON COLUMN businesses.google_place_id IS 'Google Places API place ID for reference';
