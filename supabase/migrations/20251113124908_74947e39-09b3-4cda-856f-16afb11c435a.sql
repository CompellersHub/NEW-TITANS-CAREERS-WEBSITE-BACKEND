-- Lead Scoring and Behavior Tracking System
CREATE TABLE IF NOT EXISTS public.lead_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  total_score INTEGER NOT NULL DEFAULT 0,
  last_activity TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'cold', -- cold, warm, hot, customer
  source TEXT, -- where they came from
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Track specific user behaviors
CREATE TABLE IF NOT EXISTS public.user_behaviors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  behavior_type TEXT NOT NULL, -- page_view, course_view, download, video_watch, quiz_complete, etc.
  behavior_data JSONB, -- additional context
  score_value INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Lead Magnets (free resources)
CREATE TABLE IF NOT EXISTS public.lead_magnets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  file_url TEXT,
  resource_type TEXT NOT NULL, -- ebook, guide, checklist, template, video
  course_related TEXT, -- which course this relates to
  downloads_count INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Track lead magnet downloads
CREATE TABLE IF NOT EXISTS public.lead_magnet_downloads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  lead_magnet_id UUID NOT NULL REFERENCES public.lead_magnets(id),
  downloaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Course finder quiz results
CREATE TABLE IF NOT EXISTS public.quiz_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT,
  name TEXT,
  answers JSONB NOT NULL,
  recommended_courses TEXT[] NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Referral tracking
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_email TEXT NOT NULL,
  referred_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, converted, rewarded
  reward_given BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  converted_at TIMESTAMP WITH TIME ZONE
);

-- Integration tokens for Titans Academy
CREATE TABLE IF NOT EXISTS public.integration_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  academy_user_id TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Exit intent captures
CREATE TABLE IF NOT EXISTS public.exit_captures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  offer_type TEXT NOT NULL,
  converted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lead_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_behaviors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_magnets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_magnet_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exit_captures ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lead_magnets (public read, admin write)
CREATE POLICY "Lead magnets are viewable by everyone"
  ON public.lead_magnets FOR SELECT
  USING (active = true);

CREATE POLICY "Anyone can download lead magnets"
  ON public.lead_magnet_downloads FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can submit quiz results"
  ON public.quiz_results FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can track behaviors"
  ON public.user_behaviors FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update lead scores"
  ON public.lead_scores FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can read lead scores"
  ON public.lead_scores FOR SELECT
  USING (true);

CREATE POLICY "Anyone can update existing lead scores"
  ON public.lead_scores FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can create referrals"
  ON public.referrals FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can capture exit intent"
  ON public.exit_captures FOR INSERT
  WITH CHECK (true);

-- Function to update lead score
CREATE OR REPLACE FUNCTION public.update_lead_score(p_email TEXT, p_score_change INTEGER, p_behavior TEXT)
RETURNS void AS $$
DECLARE
  v_new_score INTEGER;
  v_new_status TEXT;
BEGIN
  -- Insert or update lead score
  INSERT INTO public.lead_scores (email, total_score, last_activity)
  VALUES (p_email, p_score_change, now())
  ON CONFLICT (email) 
  DO UPDATE SET 
    total_score = public.lead_scores.total_score + p_score_change,
    last_activity = now();
  
  -- Get new score
  SELECT total_score INTO v_new_score
  FROM public.lead_scores
  WHERE email = p_email;
  
  -- Determine status based on score
  IF v_new_score >= 100 THEN
    v_new_status := 'hot';
  ELSIF v_new_score >= 50 THEN
    v_new_status := 'warm';
  ELSE
    v_new_status := 'cold';
  END IF;
  
  -- Update status
  UPDATE public.lead_scores
  SET status = v_new_status
  WHERE email = p_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_lead_scores_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_lead_scores_updated_at
  BEFORE UPDATE ON public.lead_scores
  FOR EACH ROW
  EXECUTE FUNCTION public.update_lead_scores_updated_at();

-- Insert sample lead magnets
INSERT INTO public.lead_magnets (title, description, resource_type, course_related) VALUES
('AML/KYC Career Starter Guide', 'Complete guide to starting your career in AML/KYC compliance with salary expectations, job roles, and certification paths', 'guide', 'aml-kyc'),
('Data Analysis Toolkit', 'Essential tools, resources, and cheat sheets for aspiring data analysts', 'toolkit', 'data-analysis'),
('Cybersecurity Career Roadmap', 'Step-by-step roadmap from beginner to professional cybersecurity expert', 'roadmap', 'cybersecurity'),
('Career Switcher Checklist', 'Complete checklist for successfully transitioning to a tech career', 'checklist', null),
('Free Sample Lesson', 'Try our teaching style with a free lesson from our most popular course', 'video', null);