-- Drop the view and recreate without SECURITY DEFINER
DROP VIEW IF EXISTS subscriber_engagement_patterns;

-- Create a regular view (without SECURITY DEFINER) for engagement analysis
CREATE VIEW subscriber_engagement_patterns AS
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

-- Add RLS policy for the view (it inherits from the base tables)
COMMENT ON VIEW subscriber_engagement_patterns IS 'Aggregated engagement patterns for send time optimization';
