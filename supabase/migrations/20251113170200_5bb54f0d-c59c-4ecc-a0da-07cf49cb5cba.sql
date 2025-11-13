-- Add is_active flag to email_templates for A/B test winner selection
ALTER TABLE email_templates 
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_email_templates_ab_test 
ON email_templates(ab_test_name, is_active) 
WHERE is_ab_test = true;