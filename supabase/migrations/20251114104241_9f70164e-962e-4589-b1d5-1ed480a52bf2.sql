-- Create email engagement tracking table
CREATE TABLE IF NOT EXISTS public.email_engagement_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  email TEXT NOT NULL,
  link_type TEXT NOT NULL, -- 'preferences', 'unsubscribe_digest', 'unsubscribe_all', 'discussion_link', etc.
  email_type TEXT NOT NULL, -- 'digest', 'instant_notification', etc.
  clicked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_agent TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS
ALTER TABLE public.email_engagement_tracking ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can insert engagement tracking"
  ON public.email_engagement_tracking
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view engagement tracking"
  ON public.email_engagement_tracking
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_email_engagement_user_id ON public.email_engagement_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_email_engagement_email ON public.email_engagement_tracking(email);
CREATE INDEX IF NOT EXISTS idx_email_engagement_link_type ON public.email_engagement_tracking(link_type);
CREATE INDEX IF NOT EXISTS idx_email_engagement_clicked_at ON public.email_engagement_tracking(clicked_at DESC);