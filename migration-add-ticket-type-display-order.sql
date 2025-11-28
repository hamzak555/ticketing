-- Add display_order field to ticket_types table
ALTER TABLE ticket_types
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

COMMENT ON COLUMN ticket_types.display_order IS 'Order in which ticket types are displayed to customers';
