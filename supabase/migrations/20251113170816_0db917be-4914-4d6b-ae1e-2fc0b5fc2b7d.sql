-- Add manual override controls for A/B tests
ALTER TABLE email_templates 
ADD COLUMN IF NOT EXISTS auto_winner_paused boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS traffic_weight integer DEFAULT 100 CHECK (traffic_weight >= 0 AND traffic_weight <= 100);

-- Add index for faster queries on paused tests
CREATE INDEX IF NOT EXISTS idx_email_templates_auto_winner 
ON email_templates(ab_test_name, auto_winner_paused) 
WHERE is_ab_test = true;

-- Add comment for documentation
COMMENT ON COLUMN email_templates.auto_winner_paused IS 'When true, automated winner selection is paused for this template variant';
COMMENT ON COLUMN email_templates.traffic_weight IS 'Percentage of traffic this variant should receive (0-100). Only used when auto_winner_paused is true';