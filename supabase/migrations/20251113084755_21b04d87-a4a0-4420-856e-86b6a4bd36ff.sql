-- Create email templates table
CREATE TABLE public.email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  campaign_type text NOT NULL,
  subject text NOT NULL,
  html_content text NOT NULL,
  preview_text text,
  source_type text NOT NULL CHECK (source_type IN ('ab_test_winner', 'campaign', 'manual')),
  source_id uuid,
  tags text[] DEFAULT '{}',
  usage_count integer NOT NULL DEFAULT 0,
  last_used_at timestamptz,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can view templates"
  ON public.email_templates FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert templates"
  ON public.email_templates FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update templates"
  ON public.email_templates FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete templates"
  ON public.email_templates FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add indexes
CREATE INDEX idx_email_templates_campaign_type ON public.email_templates(campaign_type);
CREATE INDEX idx_email_templates_source_type ON public.email_templates(source_type);
CREATE INDEX idx_email_templates_tags ON public.email_templates USING GIN(tags);

-- Add trigger for updated_at
CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();