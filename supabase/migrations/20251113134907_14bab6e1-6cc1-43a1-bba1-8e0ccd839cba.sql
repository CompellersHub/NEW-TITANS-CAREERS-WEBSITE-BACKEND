-- Add send time optimization fields to newsletter_subscribers
ALTER TABLE newsletter_subscribers
ADD COLUMN IF NOT EXISTS optimal_send_hour INTEGER,
ADD COLUMN IF NOT EXISTS optimal_send_day TEXT,
ADD COLUMN IF NOT EXISTS last_send_time_analysis TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN newsletter_subscribers.optimal_send_hour IS 'Optimal hour of day (0-23) based on AI analysis of engagement patterns';
COMMENT ON COLUMN newsletter_subscribers.optimal_send_day IS 'Optimal day of week for sending emails';
COMMENT ON COLUMN newsletter_subscribers.last_send_time_analysis IS 'Last time AI analyzed this subscriber send time preferences';

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_subscribers_optimal_send_hour ON newsletter_subscribers(optimal_send_hour) WHERE optimal_send_hour IS NOT NULL;

-- Add sent_at timestamp tracking to email_sends for better analytics
ALTER TABLE email_sends
ALTER COLUMN sent_at SET DEFAULT now();

-- Create a view for engagement analysis
CREATE OR REPLACE VIEW subscriber_engagement_patterns AS
SELECT 
  ns.id as subscriber_id,
  ns.email,
  ns.engagement_score,
  COUNT(es.id) as total_emails_received,
  COUNT(es.opened_at) as total_opens,
  COUNT(es.clicked_at) as total_clicks,
  ROUND(AVG(EXTRACT(HOUR FROM es.opened_at)), 0) as avg_open_hour,
  ROUND(AVG(EXTRACT(DOW FROM es.opened_at)), 0) as avg_open_day,
  MAX(es.opened_at) as last_open_at
FROM newsletter_subscribers ns
LEFT JOIN email_sends es ON es.email = ns.email
WHERE ns.active = true
GROUP BY ns.id, ns.email, ns.engagement_score;
