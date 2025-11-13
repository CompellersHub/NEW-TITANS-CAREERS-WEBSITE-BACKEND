-- Create table to track A/B test winner selection history
CREATE TABLE public.ab_test_winner_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ab_test_name TEXT NOT NULL,
  campaign_type TEXT NOT NULL,
  winner_template_id UUID NOT NULL,
  winner_template_name TEXT NOT NULL,
  winner_variant_letter TEXT NOT NULL,
  winner_open_rate NUMERIC NOT NULL,
  winner_click_rate NUMERIC NOT NULL,
  winner_combined_score NUMERIC NOT NULL,
  winner_sends_count INTEGER NOT NULL,
  improvement_percent NUMERIC NOT NULL,
  deactivated_variants_count INTEGER NOT NULL,
  deactivated_variants JSONB NOT NULL DEFAULT '[]'::jsonb,
  selected_by TEXT NOT NULL DEFAULT 'automated',
  admin_action TEXT,
  admin_user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ab_test_winner_history ENABLE ROW LEVEL SECURITY;

-- Allow admins to view history
CREATE POLICY "Admins can view winner history"
  ON public.ab_test_winner_history
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow system to insert history records
CREATE POLICY "System can insert winner history"
  ON public.ab_test_winner_history
  FOR INSERT
  WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_ab_test_winner_history_created_at ON public.ab_test_winner_history(created_at DESC);
CREATE INDEX idx_ab_test_winner_history_ab_test_name ON public.ab_test_winner_history(ab_test_name);