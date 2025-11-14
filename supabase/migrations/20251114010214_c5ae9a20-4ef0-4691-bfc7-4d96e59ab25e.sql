-- Create checkout sessions tracking table
CREATE TABLE IF NOT EXISTS public.checkout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  name TEXT,
  course_slug TEXT NOT NULL,
  course_title TEXT NOT NULL,
  original_price NUMERIC NOT NULL,
  voucher_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  abandoned BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create index for faster queries
CREATE INDEX idx_checkout_sessions_email ON public.checkout_sessions(email);
CREATE INDEX idx_checkout_sessions_abandoned ON public.checkout_sessions(abandoned, created_at);
CREATE INDEX idx_checkout_sessions_completed ON public.checkout_sessions(completed_at);

-- Create table to track abandonment emails sent
CREATE TABLE IF NOT EXISTS public.checkout_abandonment_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checkout_session_id UUID NOT NULL REFERENCES public.checkout_sessions(id) ON DELETE CASCADE,
  email_sequence_number INTEGER NOT NULL, -- 1, 2, or 3
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  email_type TEXT NOT NULL, -- 'reminder', 'discount', 'final'
  discount_code TEXT,
  opened BOOLEAN DEFAULT false,
  clicked BOOLEAN DEFAULT false,
  converted BOOLEAN DEFAULT false,
  UNIQUE(checkout_session_id, email_sequence_number)
);

-- Create index for tracking
CREATE INDEX idx_abandonment_emails_checkout ON public.checkout_abandonment_emails(checkout_session_id);
CREATE INDEX idx_abandonment_emails_sent ON public.checkout_abandonment_emails(sent_at);

-- Enable RLS
ALTER TABLE public.checkout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkout_abandonment_emails ENABLE ROW LEVEL SECURITY;

-- RLS Policies for checkout_sessions
CREATE POLICY "Anyone can insert checkout sessions"
  ON public.checkout_sessions
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update their own checkout sessions"
  ON public.checkout_sessions
  FOR UPDATE
  USING (true);

CREATE POLICY "Admins can view all checkout sessions"
  ON public.checkout_sessions
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for checkout_abandonment_emails
CREATE POLICY "System can insert abandonment emails"
  ON public.checkout_abandonment_emails
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update abandonment tracking"
  ON public.checkout_abandonment_emails
  FOR UPDATE
  USING (true);

CREATE POLICY "Admins can view abandonment emails"
  ON public.checkout_abandonment_emails
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));