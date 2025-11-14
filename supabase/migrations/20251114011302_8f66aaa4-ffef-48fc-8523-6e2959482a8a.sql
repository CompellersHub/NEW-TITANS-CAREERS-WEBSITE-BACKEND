-- Add whatsapp field to checkout_sessions
ALTER TABLE checkout_sessions ADD COLUMN IF NOT EXISTS whatsapp text;

-- Create checkout_abandonment_whatsapp table to track WhatsApp messages
CREATE TABLE IF NOT EXISTS checkout_abandonment_whatsapp (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  checkout_session_id uuid NOT NULL REFERENCES checkout_sessions(id) ON DELETE CASCADE,
  whatsapp_type text NOT NULL CHECK (whatsapp_type IN ('reminder', 'discount', 'urgency')),
  whatsapp_sequence_number integer NOT NULL,
  sent_at timestamp with time zone NOT NULL DEFAULT now(),
  discount_code text,
  delivered boolean DEFAULT false,
  read boolean DEFAULT false,
  clicked boolean DEFAULT false,
  converted boolean DEFAULT false,
  message_id text
);

-- Enable RLS
ALTER TABLE checkout_abandonment_whatsapp ENABLE ROW LEVEL SECURITY;

-- RLS Policies for checkout_abandonment_whatsapp
CREATE POLICY "Admins can view abandonment whatsapp"
  ON checkout_abandonment_whatsapp FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert abandonment whatsapp"
  ON checkout_abandonment_whatsapp FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update whatsapp tracking"
  ON checkout_abandonment_whatsapp FOR UPDATE
  USING (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_checkout_abandonment_whatsapp_session 
  ON checkout_abandonment_whatsapp(checkout_session_id);
CREATE INDEX IF NOT EXISTS idx_checkout_abandonment_whatsapp_sent_at 
  ON checkout_abandonment_whatsapp(sent_at);
CREATE INDEX IF NOT EXISTS idx_checkout_abandonment_whatsapp_message_id 
  ON checkout_abandonment_whatsapp(message_id);