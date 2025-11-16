-- Create course inquiries table
CREATE TABLE public.course_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_slug text NOT NULL,
  course_title text NOT NULL,
  inquiry_type text NOT NULL CHECK (inquiry_type IN ('free_session', 'whatsapp_group')),
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  country_code text NOT NULL,
  privacy_accepted boolean NOT NULL DEFAULT false,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.course_inquiries ENABLE ROW LEVEL SECURITY;

-- Admin can view all inquiries
CREATE POLICY "Admins can view all inquiries"
  ON public.course_inquiries FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Anyone can submit inquiries
CREATE POLICY "Anyone can submit inquiries"
  ON public.course_inquiries FOR INSERT
  WITH CHECK (true);

-- Admins can update inquiry status
CREATE POLICY "Admins can update inquiries"
  ON public.course_inquiries FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add indexes for performance
CREATE INDEX idx_course_inquiries_course_slug ON public.course_inquiries(course_slug);
CREATE INDEX idx_course_inquiries_created_at ON public.course_inquiries(created_at DESC);
CREATE INDEX idx_course_inquiries_status ON public.course_inquiries(status);

-- Add updated_at trigger
CREATE TRIGGER update_course_inquiries_updated_at
  BEFORE UPDATE ON public.course_inquiries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();