-- ============================================================
-- Strava App Configuration Table
-- ============================================================
-- Stores Strava app credentials in the database instead of .env
-- This allows dynamic configuration without server restarts
-- Created: 2026-07-23

-- Create table for Strava app configurations
CREATE TABLE IF NOT EXISTS strava_app_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  app_name TEXT NOT NULL UNIQUE, -- e.g., 'primary', 'secondary', or descriptive name
  client_id TEXT NOT NULL,
  client_secret TEXT NOT NULL,
  redirect_uri TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false, -- Which app to use by default
  description TEXT, -- Optional description
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for quick lookup of active app
CREATE INDEX IF NOT EXISTS idx_strava_app_configs_active 
  ON strava_app_configs(is_active) 
  WHERE is_active = true;

-- Enable Row Level Security
ALTER TABLE strava_app_configs ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read configs (needed for OAuth)
-- Note: In production, you might want to restrict this to authenticated users
CREATE POLICY "Allow read access to Strava app configs"
  ON strava_app_configs
  FOR SELECT
  USING (true);

-- Policy: Only authenticated users can manage configs
-- Note: You might want to add a role check here for admin users
CREATE POLICY "Authenticated users can manage Strava app configs"
  ON strava_app_configs
  FOR ALL
  USING (auth.role() = 'authenticated');

-- Function to ensure only one app is active at a time
CREATE OR REPLACE FUNCTION ensure_single_active_strava_app()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_active = true THEN
    -- Deactivate all other apps
    UPDATE strava_app_configs 
    SET is_active = false 
    WHERE id != NEW.id AND is_active = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to maintain single active app
DROP TRIGGER IF EXISTS ensure_single_active_strava_app_trigger ON strava_app_configs;
CREATE TRIGGER ensure_single_active_strava_app_trigger
  BEFORE INSERT OR UPDATE ON strava_app_configs
  FOR EACH ROW
  WHEN (NEW.is_active = true)
  EXECUTE FUNCTION ensure_single_active_strava_app();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_strava_app_config_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update timestamp
DROP TRIGGER IF EXISTS update_strava_app_config_timestamp_trigger ON strava_app_configs;
CREATE TRIGGER update_strava_app_config_timestamp_trigger
  BEFORE UPDATE ON strava_app_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_strava_app_config_timestamp();

-- Add comment
COMMENT ON TABLE strava_app_configs IS 'Stores Strava OAuth app configurations. Replaces environment variables for more flexible app management.';
COMMENT ON COLUMN strava_app_configs.is_active IS 'Only one app can be active at a time. This is the default app used for new connections.';
COMMENT ON COLUMN strava_app_configs.client_secret IS 'Strava OAuth client secret. Should be kept secure. Consider encryption in production.';

-- ============================================================
-- Seed with current configuration
-- ============================================================
-- Insert your current Strava app configuration
-- Replace these values with your actual credentials

-- Example: Insert the secondary app (Client ID: 45863) as the active app
INSERT INTO strava_app_configs (app_name, client_id, client_secret, redirect_uri, is_active, description)
VALUES (
  'primary',
  '45863',
  'cca1d5a821999ca5416895c81ebfcb09bf9352cb',
  'http://localhost:5173/strava/callback',
  true,
  'Primary Strava app configuration'
)
ON CONFLICT (app_name) DO UPDATE SET
  client_id = EXCLUDED.client_id,
  client_secret = EXCLUDED.client_secret,
  redirect_uri = EXCLUDED.redirect_uri,
  is_active = EXCLUDED.is_active,
  description = EXCLUDED.description;

-- Optional: Keep the old app for reference (inactive)
-- INSERT INTO strava_app_configs (app_name, client_id, client_secret, redirect_uri, is_active, description)
-- VALUES (
--   'legacy',
--   '239101',
--   '437867834e3f11608232aa6984e6b61bd69b4655',
--   'http://localhost:5173/strava/callback',
--   false,
--   'Old app - exceeded quota limit'
-- )
-- ON CONFLICT (app_name) DO NOTHING;
