-- Split fee_payer into separate columns for Stripe and Platform fees
-- This allows businesses to independently configure who pays each type of fee

-- Add new columns
ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS stripe_fee_payer TEXT DEFAULT 'customer'
CHECK (stripe_fee_payer IN ('customer', 'business'));

ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS platform_fee_payer TEXT DEFAULT 'customer'
CHECK (platform_fee_payer IN ('customer', 'business'));

-- Migrate existing data from fee_payer to new columns
UPDATE businesses
SET
  stripe_fee_payer = COALESCE(fee_payer, 'customer'),
  platform_fee_payer = COALESCE(fee_payer, 'customer')
WHERE stripe_fee_payer IS NULL OR platform_fee_payer IS NULL;

-- Drop old column
ALTER TABLE businesses
DROP COLUMN IF EXISTS fee_payer;

-- Add comments
COMMENT ON COLUMN businesses.stripe_fee_payer IS 'Determines who pays Stripe processing fees: customer (fees added to total) or business (fees deducted from revenue)';
COMMENT ON COLUMN businesses.platform_fee_payer IS 'Determines who pays platform fees: customer (fees added to total) or business (fees deducted from revenue)';
