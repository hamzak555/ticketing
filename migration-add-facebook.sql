-- Add facebook field to businesses table
ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS facebook TEXT;

COMMENT ON COLUMN businesses.facebook IS 'Facebook page URL or username for the business';
