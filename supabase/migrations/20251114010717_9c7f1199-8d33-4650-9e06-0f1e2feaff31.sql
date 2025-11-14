-- Add phone field to checkout_sessions
ALTER TABLE checkout_sessions ADD COLUMN IF NOT EXISTS phone text;

-- Create checkout_abandonment_sms table to track SMS sends
CREATE TABLE IF NOT EXISTS checkout_abandonment_sms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  checkout_session_id uuid NOT NULL REFERENCES checkout_sessions(id) ON DELETE CASCADE,
  sms_type text NOT NULL CHECK (sms_type IN ('reminder', 'discount', 'urgency')),
  sms_sequence_number integer NOT NULL,
  sent_at timestamp with time zone NOT NULL DEFAULT now(),
  discount_code text,
  delivered boolean DEFAULT false,
  clicked boolean DEFAULT false,
  converted boolean DEFAULT false
);

-- Enable RLS
ALTER TABLE checkout_abandonment_sms ENABLE ROW LEVEL SECURITY;

-- RLS Policies for checkout_abandonment_sms
CREATE POLICY "Admins can view abandonment sms"
  ON checkout_abandonment_sms FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert abandonment sms"
  ON checkout_abandonment_sms FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update sms tracking"
  ON checkout_abandonment_sms FOR UPDATE
  USING (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_checkout_abandonment_sms_session 
  ON checkout_abandonment_sms(checkout_session_id);
CREATE INDEX IF NOT EXISTS idx_checkout_abandonment_sms_sent_at 
  ON checkout_abandonment_sms(sent_at);