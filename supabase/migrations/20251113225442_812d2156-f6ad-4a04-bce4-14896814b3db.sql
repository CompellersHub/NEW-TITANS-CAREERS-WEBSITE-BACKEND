-- Create scheduled_voucher_campaigns table
CREATE TABLE public.scheduled_voucher_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  voucher_id UUID NOT NULL REFERENCES public.vouchers(id) ON DELETE CASCADE,
  segment_id UUID REFERENCES public.subscriber_segments(id) ON DELETE SET NULL,
  manual_emails TEXT[] DEFAULT '{}',
  subject TEXT NOT NULL,
  message TEXT,
  scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
  recurrence_type TEXT NOT NULL DEFAULT 'none' CHECK (recurrence_type IN ('none', 'daily', 'weekly', 'monthly')),
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'sent', 'cancelled', 'failed')),
  last_sent_at TIMESTAMP WITH TIME ZONE,
  next_send_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.scheduled_voucher_campaigns ENABLE ROW LEVEL SECURITY;

-- Policies for admins
CREATE POLICY "Admins can view scheduled campaigns"
  ON public.scheduled_voucher_campaigns
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert scheduled campaigns"
  ON public.scheduled_voucher_campaigns
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update scheduled campaigns"
  ON public.scheduled_voucher_campaigns
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete scheduled campaigns"
  ON public.scheduled_voucher_campaigns
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for efficient querying
CREATE INDEX idx_scheduled_campaigns_next_send ON public.scheduled_voucher_campaigns(next_send_at) WHERE status = 'scheduled';

-- Trigger to update next_send_at based on recurrence
CREATE OR REPLACE FUNCTION calculate_next_send_time()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.recurrence_type = 'none' THEN
    NEW.next_send_at := NEW.scheduled_time;
  ELSIF NEW.recurrence_type = 'daily' THEN
    NEW.next_send_at := COALESCE(NEW.last_sent_at, NEW.scheduled_time) + INTERVAL '1 day';
  ELSIF NEW.recurrence_type = 'weekly' THEN
    NEW.next_send_at := COALESCE(NEW.last_sent_at, NEW.scheduled_time) + INTERVAL '1 week';
  ELSIF NEW.recurrence_type = 'monthly' THEN
    NEW.next_send_at := COALESCE(NEW.last_sent_at, NEW.scheduled_time) + INTERVAL '1 month';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_next_send_time
BEFORE INSERT OR UPDATE ON public.scheduled_voucher_campaigns
FOR EACH ROW
EXECUTE FUNCTION calculate_next_send_time();