-- ============================================
-- PHASE 1: Database & Infrastructure Setup
-- ============================================

-- User notification preferences for account-related events
CREATE TABLE IF NOT EXISTS public.user_account_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  email_receipts BOOLEAN DEFAULT true,
  payment_reminders BOOLEAN DEFAULT true,
  payment_confirmations BOOLEAN DEFAULT true,
  course_access_notifications BOOLEAN DEFAULT true,
  marketing_emails BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_account_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_account_preferences
CREATE POLICY "Users can view own preferences"
  ON public.user_account_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON public.user_account_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON public.user_account_preferences
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Automated notification queue with priority
CREATE TABLE IF NOT EXISTS public.notification_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users,
  email TEXT NOT NULL,
  notification_type TEXT NOT NULL,
  priority TEXT DEFAULT 'normal',
  status TEXT DEFAULT 'pending',
  data JSONB DEFAULT '{}',
  scheduled_for TIMESTAMPTZ DEFAULT now(),
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notification_queue
CREATE POLICY "Users can view own notifications"
  ON public.notification_queue
  FOR SELECT
  USING (auth.uid() = user_id OR email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "System can insert notifications"
  ON public.notification_queue
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update notifications"
  ON public.notification_queue
  FOR UPDATE
  USING (true);

-- User activity log for transparency
CREATE TABLE IF NOT EXISTS public.user_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users,
  email TEXT NOT NULL,
  activity_type TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_activity_log_user_id ON public.user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_email ON public.user_activity_log(email);
CREATE INDEX IF NOT EXISTS idx_user_activity_log_created_at ON public.user_activity_log(created_at DESC);

-- Enable RLS
ALTER TABLE public.user_activity_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_activity_log
CREATE POLICY "Users can view own activity"
  ON public.user_activity_log
  FOR SELECT
  USING (auth.uid() = user_id OR email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "System can insert activity"
  ON public.user_activity_log
  FOR INSERT
  WITH CHECK (true);

-- Admins can view all activity
CREATE POLICY "Admins can view all activity"
  ON public.user_activity_log
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create comprehensive view for order history
CREATE OR REPLACE VIEW public.user_order_history AS
SELECT 
  e.id,
  e.customer_email,
  e.course_slug,
  e.course_title,
  e.price,
  e.payment_method,
  e.payment_status,
  e.payment_provider_reference,
  e.created_at as purchase_date,
  e.payment_metadata,
  e.installment_plan,
  pi.payment_reference,
  pi.expires_at,
  pi.final_price,
  pi.voucher_code,
  bto.payment_proof_urls,
  bto.verified_at,
  bto.status as bank_transfer_status,
  CASE 
    WHEN e.payment_status = 'completed' THEN 'completed'
    WHEN bto.status = 'awaiting_payment' THEN 'pending_proof'
    WHEN bto.status = 'awaiting_verification' THEN 'under_review'
    WHEN pi.payment_status = 'pending' AND pi.expires_at > now() THEN 'pending'
    WHEN pi.payment_status = 'pending' AND pi.expires_at <= now() THEN 'expired'
    ELSE COALESCE(e.payment_status, 'failed')
  END as display_status
FROM public.enrollments e
LEFT JOIN public.payment_intents pi ON e.payment_provider_reference = pi.id::text
LEFT JOIN public.bank_transfer_orders bto ON e.payment_provider_reference = bto.id::text
ORDER BY e.created_at DESC;

-- Grant access to the view
GRANT SELECT ON public.user_order_history TO authenticated;

-- Trigger for updating updated_at on user_account_preferences
CREATE OR REPLACE FUNCTION public.update_user_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_account_preferences_updated_at
  BEFORE UPDATE ON public.user_account_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_preferences_updated_at();

-- Function to log user activity (can be called from edge functions)
CREATE OR REPLACE FUNCTION public.log_user_activity(
  p_user_id UUID,
  p_email TEXT,
  p_activity_type TEXT,
  p_description TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  activity_id UUID;
BEGIN
  INSERT INTO public.user_activity_log (
    user_id,
    email,
    activity_type,
    description,
    metadata
  ) VALUES (
    p_user_id,
    p_email,
    p_activity_type,
    p_description,
    p_metadata
  )
  RETURNING id INTO activity_id;
  
  RETURN activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for notification_queue for faster processing
CREATE INDEX IF NOT EXISTS idx_notification_queue_status ON public.notification_queue(status);
CREATE INDEX IF NOT EXISTS idx_notification_queue_scheduled ON public.notification_queue(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_notification_queue_priority ON public.notification_queue(priority);