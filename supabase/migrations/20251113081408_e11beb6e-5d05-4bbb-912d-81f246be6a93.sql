-- Create newsletter subscribers table
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  whatsapp TEXT,
  name TEXT,
  source TEXT, -- where they signed up from (footer, blog, resources, etc.)
  subscribed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  welcome_email_sent BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create index for faster email lookups
CREATE INDEX idx_newsletter_email ON public.newsletter_subscribers(email);
CREATE INDEX idx_newsletter_subscribed_at ON public.newsletter_subscribers(subscribed_at DESC);
CREATE INDEX idx_newsletter_active ON public.newsletter_subscribers(active);

-- Enable Row Level Security
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Allow public to insert (signup)
CREATE POLICY "Anyone can subscribe to newsletter"
ON public.newsletter_subscribers
FOR INSERT
WITH CHECK (true);

-- Only authenticated users (admins) can view subscribers
CREATE POLICY "Only authenticated users can view subscribers"
ON public.newsletter_subscribers
FOR SELECT
USING (auth.role() = 'authenticated');

-- Add comment
COMMENT ON TABLE public.newsletter_subscribers IS 'Stores newsletter subscriber information including email and WhatsApp for lead generation';
