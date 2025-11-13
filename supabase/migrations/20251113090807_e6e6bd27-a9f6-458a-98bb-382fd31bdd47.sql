-- Add segment targeting to campaign content
ALTER TABLE campaign_content 
ADD COLUMN segment_id uuid REFERENCES subscriber_segments(id) ON DELETE SET NULL;

-- Add segment info to email campaigns for tracking
ALTER TABLE email_campaigns 
ADD COLUMN segment_id uuid REFERENCES subscriber_segments(id) ON DELETE SET NULL;

-- Add index for performance
CREATE INDEX idx_campaign_content_segment ON campaign_content(segment_id);
CREATE INDEX idx_email_campaigns_segment ON email_campaigns(segment_id);

-- Add comment for clarity
COMMENT ON COLUMN campaign_content.segment_id IS 'Optional segment to target. If null, targets all active subscribers';
COMMENT ON COLUMN email_campaigns.segment_id IS 'Segment that was targeted when campaign was sent';