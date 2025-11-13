-- Create table for email A/B test variants
CREATE TABLE email_ab_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_name TEXT NOT NULL,
  subject_line TEXT NOT NULL,
  preview_text TEXT,
  email_type TEXT NOT NULL DEFAULT 'conversation_summary',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(variant_name, email_type)
);

-- Create table to track which variant was sent
CREATE TABLE email_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES ai_advisor_conversations(id),
  variant_id UUID REFERENCES email_ab_variants(id),
  email TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  tracking_id TEXT UNIQUE DEFAULT gen_random_uuid()::TEXT
);

-- Create index for faster lookups
CREATE INDEX idx_email_sends_conversation ON email_sends(conversation_id);
CREATE INDEX idx_email_sends_variant ON email_sends(variant_id);
CREATE INDEX idx_email_sends_tracking ON email_sends(tracking_id);

-- Enable RLS
ALTER TABLE email_ab_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_sends ENABLE ROW LEVEL SECURITY;

-- RLS Policies for email_ab_variants
CREATE POLICY "Admins can manage variants"
  ON email_ab_variants
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for email_sends (admin view only)
CREATE POLICY "Admins can view email sends"
  ON email_sends
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Anyone can update opened_at and clicked_at for tracking
CREATE POLICY "Anyone can track email engagement"
  ON email_sends
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Insert default A/B test variants
INSERT INTO email_ab_variants (variant_name, subject_line, preview_text, email_type) VALUES
  ('control', 'Your AI Career Advisor Conversation Summary', 'Review your personalized course recommendations', 'conversation_summary'),
  ('urgency', '⏰ Your Personalized Course Recommendations Are Ready!', 'Don''t miss out on these career opportunities', 'conversation_summary'),
  ('curiosity', '🎯 Discover What We Found For Your Career Goals', 'Inside: Courses matched to your interests', 'conversation_summary'),
  ('social_proof', '✨ Join 1000+ Students - Your Course Recommendations', 'See why others chose these programs', 'conversation_summary'),
  ('direct', 'Here Are Your Recommended Courses', 'Based on our conversation today', 'conversation_summary');