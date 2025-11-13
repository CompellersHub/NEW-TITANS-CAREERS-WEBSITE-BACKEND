-- Create function to update timestamps (if it doesn't exist)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create A/B Tests table
CREATE TABLE public.ab_tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  campaign_type text NOT NULL,
  test_percentage integer NOT NULL DEFAULT 20 CHECK (test_percentage > 0 AND test_percentage <= 50),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'running', 'completed', 'sent')),
  winner_variant_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  started_at timestamptz,
  completed_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Create A/B Test Variants table
CREATE TABLE public.ab_test_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ab_test_id uuid NOT NULL REFERENCES public.ab_tests(id) ON DELETE CASCADE,
  variant_name text NOT NULL,
  subject text NOT NULL,
  html_content text NOT NULL,
  preview_text text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(ab_test_id, variant_name)
);

-- Create A/B Test Results table
CREATE TABLE public.ab_test_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ab_test_id uuid NOT NULL REFERENCES public.ab_tests(id) ON DELETE CASCADE,
  variant_id uuid NOT NULL REFERENCES public.ab_test_variants(id) ON DELETE CASCADE,
  sent_count integer NOT NULL DEFAULT 0,
  open_count integer NOT NULL DEFAULT 0,
  click_count integer NOT NULL DEFAULT 0,
  unsubscribe_count integer NOT NULL DEFAULT 0,
  open_rate numeric GENERATED ALWAYS AS (
    CASE WHEN sent_count > 0 THEN ROUND((open_count::numeric / sent_count::numeric) * 100, 2) ELSE 0 END
  ) STORED,
  click_rate numeric GENERATED ALWAYS AS (
    CASE WHEN sent_count > 0 THEN ROUND((click_count::numeric / sent_count::numeric) * 100, 2) ELSE 0 END
  ) STORED,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(ab_test_id, variant_id)
);

-- Enable RLS
ALTER TABLE public.ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ab_test_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ab_test_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ab_tests
CREATE POLICY "Admins can view ab_tests"
  ON public.ab_tests FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert ab_tests"
  ON public.ab_tests FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update ab_tests"
  ON public.ab_tests FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete ab_tests"
  ON public.ab_tests FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for ab_test_variants
CREATE POLICY "Admins can view variants"
  ON public.ab_test_variants FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert variants"
  ON public.ab_test_variants FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update variants"
  ON public.ab_test_variants FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete variants"
  ON public.ab_test_variants FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for ab_test_results
CREATE POLICY "Admins can view results"
  ON public.ab_test_results FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert results"
  ON public.ab_test_results FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update results"
  ON public.ab_test_results FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add indexes
CREATE INDEX idx_ab_test_variants_test_id ON public.ab_test_variants(ab_test_id);
CREATE INDEX idx_ab_test_results_test_id ON public.ab_test_results(ab_test_id);
CREATE INDEX idx_ab_test_results_variant_id ON public.ab_test_results(variant_id);

-- Add trigger
CREATE TRIGGER update_ab_test_results_updated_at
  BEFORE UPDATE ON public.ab_test_results
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();