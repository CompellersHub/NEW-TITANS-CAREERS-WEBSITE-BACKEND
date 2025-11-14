-- Add Slack webhook integration to recovery alert settings
ALTER TABLE public.recovery_alert_settings
ADD COLUMN slack_webhook_url TEXT,
ADD COLUMN slack_enabled BOOLEAN DEFAULT false;

COMMENT ON COLUMN public.recovery_alert_settings.slack_webhook_url IS 'Slack webhook URL for sending alerts';
COMMENT ON COLUMN public.recovery_alert_settings.slack_enabled IS 'Whether Slack alerts are enabled';