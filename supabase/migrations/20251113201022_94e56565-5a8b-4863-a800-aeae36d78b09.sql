-- Create admin notification preferences table
CREATE TABLE IF NOT EXISTS public.admin_notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  email text NOT NULL,
  instant_alerts boolean DEFAULT true,
  daily_digest boolean DEFAULT false,
  digest_time integer DEFAULT 9, -- Hour of day (0-23) for daily digest
  notify_new_status boolean DEFAULT true,
  notify_in_progress_status boolean DEFAULT false,
  notify_resolved_status boolean DEFAULT false,
  notify_archived_status boolean DEFAULT false,
  notify_contact_form boolean DEFAULT true,
  notify_quick_contact boolean DEFAULT true,
  notify_feedback boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE(admin_user_id)
);

-- Enable RLS
ALTER TABLE public.admin_notification_preferences ENABLE ROW LEVEL SECURITY;

-- Admins can view their own preferences
CREATE POLICY "Admins can view own preferences"
ON public.admin_notification_preferences
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) AND admin_user_id = auth.uid());

-- Admins can insert their own preferences
CREATE POLICY "Admins can insert own preferences"
ON public.admin_notification_preferences
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) AND admin_user_id = auth.uid());

-- Admins can update their own preferences
CREATE POLICY "Admins can update own preferences"
ON public.admin_notification_preferences
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role) AND admin_user_id = auth.uid());

-- Create trigger to update updated_at
CREATE TRIGGER update_admin_notification_preferences_timestamp
BEFORE UPDATE ON public.admin_notification_preferences
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_admin_notification_preferences_user ON public.admin_notification_preferences(admin_user_id);