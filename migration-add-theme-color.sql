-- Add theme_color column to businesses table
ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS theme_color TEXT DEFAULT '#3b82f6';

-- Add comment to explain the column
COMMENT ON COLUMN businesses.theme_color IS 'Hex color code for business theme color used in background glow effects on public pages';
