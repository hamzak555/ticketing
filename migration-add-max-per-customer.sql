-- Add max_per_customer field to ticket_types table
ALTER TABLE ticket_types
ADD COLUMN IF NOT EXISTS max_per_customer INTEGER;

COMMENT ON COLUMN ticket_types.max_per_customer IS 'Maximum number of tickets of this type that a single customer can purchase. NULL means unlimited.';
