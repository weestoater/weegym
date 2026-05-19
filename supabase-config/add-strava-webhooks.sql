-- Add webhook subscription fields to strava_connections table
-- Run this in your Supabase SQL Editor

ALTER TABLE strava_connections
ADD COLUMN IF NOT EXISTS webhook_subscription_id INTEGER,
ADD COLUMN IF NOT EXISTS webhook_callback_url TEXT,
ADD COLUMN IF NOT EXISTS webhook_subscribed_at TIMESTAMPTZ;

-- Add index for faster webhook lookups by athlete_id
CREATE INDEX IF NOT EXISTS idx_strava_connections_athlete_id 
ON strava_connections(athlete_id);

-- Add index for webhook subscription lookups
CREATE INDEX IF NOT EXISTS idx_strava_connections_webhook_subscription 
ON strava_connections(webhook_subscription_id) 
WHERE webhook_subscription_id IS NOT NULL;

COMMENT ON COLUMN strava_connections.webhook_subscription_id IS 'Strava webhook subscription ID';
COMMENT ON COLUMN strava_connections.webhook_callback_url IS 'Public URL for webhook events';
COMMENT ON COLUMN strava_connections.webhook_subscribed_at IS 'When webhook was subscribed';
