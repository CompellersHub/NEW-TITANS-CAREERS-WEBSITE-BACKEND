-- Add pending and rejected statuses, plus approval tracking
ALTER TABLE scheduled_voucher_campaigns 
ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS approved_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS rejection_reason text;

-- Update status check to include new statuses
COMMENT ON COLUMN scheduled_voucher_campaigns.status IS 'Campaign status: pending, scheduled, sent, failed, cancelled, rejected';

-- Create index for faster filtering by status
CREATE INDEX IF NOT EXISTS idx_scheduled_campaigns_status ON scheduled_voucher_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_campaigns_approved_by ON scheduled_voucher_campaigns(approved_by);