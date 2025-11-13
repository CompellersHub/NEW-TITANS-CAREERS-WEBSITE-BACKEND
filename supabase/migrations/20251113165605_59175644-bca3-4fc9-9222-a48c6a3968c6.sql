-- Add A/B testing support to email templates
ALTER TABLE email_templates ADD COLUMN IF NOT EXISTS is_ab_test BOOLEAN DEFAULT false;
ALTER TABLE email_templates ADD COLUMN IF NOT EXISTS ab_test_name TEXT;
ALTER TABLE email_templates ADD COLUMN IF NOT EXISTS variant_letter TEXT CHECK (variant_letter IN ('A', 'B', 'C', 'D'));
ALTER TABLE email_templates ADD COLUMN IF NOT EXISTS ab_test_group_id UUID;

-- Create index for A/B test grouping
CREATE INDEX IF NOT EXISTS idx_email_templates_ab_test_group ON email_templates(ab_test_group_id) WHERE is_ab_test = true;

-- Add variant tracking to email_sends
ALTER TABLE email_sends ADD COLUMN IF NOT EXISTS template_id UUID;
ALTER TABLE email_sends ADD COLUMN IF NOT EXISTS ab_variant_letter TEXT;

-- Create template performance view
CREATE OR REPLACE VIEW template_performance AS
SELECT 
  t.id as template_id,
  t.name as template_name,
  t.campaign_type,
  t.is_ab_test,
  t.ab_test_name,
  t.variant_letter,
  t.tags,
  COUNT(DISTINCT es.id) as sends_count,
  COUNT(DISTINCT CASE WHEN es.opened_at IS NOT NULL THEN es.id END) as opens_count,
  COUNT(DISTINCT CASE WHEN es.clicked_at IS NOT NULL THEN es.id END) as clicks_count,
  CASE 
    WHEN COUNT(DISTINCT es.id) > 0 
    THEN ROUND((COUNT(DISTINCT CASE WHEN es.opened_at IS NOT NULL THEN es.id END)::numeric / COUNT(DISTINCT es.id)::numeric) * 100, 2)
    ELSE 0 
  END as open_rate,
  CASE 
    WHEN COUNT(DISTINCT es.id) > 0 
    THEN ROUND((COUNT(DISTINCT CASE WHEN es.clicked_at IS NOT NULL THEN es.id END)::numeric / COUNT(DISTINCT es.id)::numeric) * 100, 2)
    ELSE 0 
  END as click_rate
FROM email_templates t
LEFT JOIN email_sends es ON es.template_id = t.id
WHERE t.campaign_type = 'nurture'
GROUP BY t.id, t.name, t.campaign_type, t.is_ab_test, t.ab_test_name, t.variant_letter, t.tags;

COMMENT ON VIEW template_performance IS 'Performance metrics for email templates including A/B test results';