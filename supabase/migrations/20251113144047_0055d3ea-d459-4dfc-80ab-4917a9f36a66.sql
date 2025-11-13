-- Create form analytics table
CREATE TABLE IF NOT EXISTS public.form_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  form_name TEXT NOT NULL,
  step_number INTEGER,
  step_title TEXT,
  field_name TEXT,
  event_type TEXT NOT NULL, -- 'field_focus', 'field_blur', 'field_error', 'step_complete', 'step_abandon', 'form_complete', 'form_abandon'
  time_spent_ms INTEGER,
  error_message TEXT,
  session_id TEXT NOT NULL,
  user_email TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.form_analytics ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert analytics (anonymous tracking)
CREATE POLICY "Anyone can insert form analytics"
  ON public.form_analytics
  FOR INSERT
  WITH CHECK (true);

-- Only admins can view analytics
CREATE POLICY "Admins can view form analytics"
  ON public.form_analytics
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for common queries
CREATE INDEX idx_form_analytics_session ON public.form_analytics(session_id);
CREATE INDEX idx_form_analytics_form_name ON public.form_analytics(form_name);
CREATE INDEX idx_form_analytics_event_type ON public.form_analytics(event_type);
CREATE INDEX idx_form_analytics_created_at ON public.form_analytics(created_at DESC);

-- Create a view for form analytics summary
CREATE OR REPLACE VIEW public.form_analytics_summary AS
SELECT 
  form_name,
  step_number,
  step_title,
  field_name,
  COUNT(*) as total_events,
  COUNT(DISTINCT session_id) as unique_sessions,
  AVG(time_spent_ms) as avg_time_spent_ms,
  COUNT(CASE WHEN event_type = 'field_error' THEN 1 END) as error_count,
  COUNT(CASE WHEN event_type = 'step_abandon' THEN 1 END) as abandon_count,
  COUNT(CASE WHEN event_type = 'step_complete' THEN 1 END) as complete_count
FROM public.form_analytics
GROUP BY form_name, step_number, step_title, field_name;

COMMENT ON TABLE public.form_analytics IS 'Tracks user interactions with forms for analytics and optimization';