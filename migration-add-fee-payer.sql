-- Add fee_payer column to businesses table
-- This determines who pays the processing fees: customer or business
ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS fee_payer TEXT DEFAULT 'customer'
CHECK (fee_payer IN ('customer', 'business'));

-- Update existing businesses to have customer pay fees by default
UPDATE businesses
SET fee_payer = 'customer'
WHERE fee_payer IS NULL;

-- Add comment to document the column
COMMENT ON COLUMN businesses.fee_payer IS 'Determines who pays processing fees: customer (fees added to total) or business (fees deducted from revenue)';
