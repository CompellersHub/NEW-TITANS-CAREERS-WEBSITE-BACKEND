-- Force Supabase types regeneration with a minimal change
-- Add a helpful index that will also improve query performance
CREATE INDEX IF NOT EXISTS idx_form_analytics_form_field ON public.form_analytics(form_name, field_name) WHERE field_name IS NOT NULL;

-- Add index for time-based queries
CREATE INDEX IF NOT EXISTS idx_form_analytics_time_range ON public.form_analytics(created_at DESC, form_name);

-- Update comment to trigger types regeneration
COMMENT ON TABLE public.form_analytics IS 'Comprehensive form interaction tracking for UX analytics and optimization. Tracks field-level events, validation errors, and user flow patterns.';