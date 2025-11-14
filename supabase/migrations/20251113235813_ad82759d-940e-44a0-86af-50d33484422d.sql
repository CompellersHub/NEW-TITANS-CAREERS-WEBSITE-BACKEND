
-- Update status constraint to include pending_approval and rejected statuses
ALTER TABLE scheduled_voucher_campaigns DROP CONSTRAINT IF EXISTS scheduled_voucher_campaigns_status_check;

ALTER TABLE scheduled_voucher_campaigns 
ADD CONSTRAINT scheduled_voucher_campaigns_status_check 
CHECK (status = ANY (ARRAY['pending_approval'::text, 'scheduled'::text, 'sent'::text, 'cancelled'::text, 'failed'::text, 'rejected'::text]));
