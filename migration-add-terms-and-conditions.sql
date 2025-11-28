-- Add terms and conditions field to businesses table
ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS terms_and_conditions TEXT;

COMMENT ON COLUMN businesses.terms_and_conditions IS 'Custom terms and conditions for ticket purchases';
