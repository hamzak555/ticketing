-- Add social media and address fields to businesses table
ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS instagram TEXT,
ADD COLUMN IF NOT EXISTS tiktok TEXT;

COMMENT ON COLUMN businesses.address IS 'Physical address of the business';
COMMENT ON COLUMN businesses.instagram IS 'Instagram handle or URL';
COMMENT ON COLUMN businesses.tiktok IS 'TikTok handle or URL';
