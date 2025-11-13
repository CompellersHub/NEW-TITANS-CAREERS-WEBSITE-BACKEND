-- Create campaigns table to track sent emails
CREATE TABLE IF NOT EXISTS public.email_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_type TEXT NOT NULL, -- 'career_tips', 'job_alerts', 'course_updates'
  subject TEXT NOT NULL,
  content_key TEXT NOT NULL, -- unique identifier for content
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  recipient_count INTEGER NOT NULL DEFAULT 0,
  success_count INTEGER NOT NULL DEFAULT 0,
  failure_count INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create index for faster lookups
CREATE INDEX idx_email_campaigns_sent_at ON public.email_campaigns(sent_at DESC);
CREATE INDEX idx_email_campaigns_type ON public.email_campaigns(campaign_type);
CREATE INDEX idx_email_campaigns_content_key ON public.email_campaigns(content_key);

-- Enable Row Level Security
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;

-- Admins can view all campaigns
CREATE POLICY "Admins can view all campaigns"
ON public.email_campaigns
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can insert campaigns
CREATE POLICY "Admins can insert campaigns"
ON public.email_campaigns
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create campaign content library table
CREATE TABLE IF NOT EXISTS public.campaign_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_key TEXT NOT NULL UNIQUE,
  campaign_type TEXT NOT NULL,
  subject TEXT NOT NULL,
  preview_text TEXT,
  html_content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0, -- higher priority content sent first
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index
CREATE INDEX idx_campaign_content_type ON public.campaign_content(campaign_type);
CREATE INDEX idx_campaign_content_active ON public.campaign_content(is_active);

-- Enable RLS
ALTER TABLE public.campaign_content ENABLE ROW LEVEL SECURITY;

-- Admins can manage campaign content
CREATE POLICY "Admins can view campaign content"
ON public.campaign_content
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert campaign content"
ON public.campaign_content
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update campaign content"
ON public.campaign_content
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete campaign content"
ON public.campaign_content
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Add comments
COMMENT ON TABLE public.email_campaigns IS 'Tracks sent email campaigns and their results';
COMMENT ON TABLE public.campaign_content IS 'Stores reusable email campaign templates and content';
