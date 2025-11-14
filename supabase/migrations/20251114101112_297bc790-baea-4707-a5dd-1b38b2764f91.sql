-- Create course_lessons table
CREATE TABLE public.course_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_slug TEXT NOT NULL,
  module_number INTEGER NOT NULL,
  lesson_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER,
  content_type TEXT DEFAULT 'video',
  is_free_preview BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(course_slug, module_number, lesson_number)
);

-- Enable RLS
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;

-- Anyone can view lessons
CREATE POLICY "Anyone can view lessons"
ON public.course_lessons
FOR SELECT
USING (true);

-- Admins can manage lessons
CREATE POLICY "Admins can manage lessons"
ON public.course_lessons
FOR ALL
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Create user_lesson_progress table
CREATE TABLE public.user_lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.course_lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Enable RLS
ALTER TABLE public.user_lesson_progress ENABLE ROW LEVEL SECURITY;

-- Users can view their own progress
CREATE POLICY "Users can view own progress"
ON public.user_lesson_progress
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own progress
CREATE POLICY "Users can update own progress"
ON public.user_lesson_progress
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can modify own progress"
ON public.user_lesson_progress
FOR UPDATE
USING (auth.uid() = user_id);

-- Create course_certificates table
CREATE TABLE public.course_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_slug TEXT NOT NULL,
  course_title TEXT NOT NULL,
  completion_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  certificate_number TEXT NOT NULL UNIQUE,
  user_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, course_slug)
);

-- Enable RLS
ALTER TABLE public.course_certificates ENABLE ROW LEVEL SECURITY;

-- Users can view their own certificates
CREATE POLICY "Users can view own certificates"
ON public.course_certificates
FOR SELECT
USING (auth.uid() = user_id);

-- System can create certificates
CREATE POLICY "System can create certificates"
ON public.course_certificates
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can view all certificates
CREATE POLICY "Admins can view all certificates"
ON public.course_certificates
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Function to generate certificate number
CREATE OR REPLACE FUNCTION generate_certificate_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  cert_number TEXT;
BEGIN
  cert_number := 'TC-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(FLOOR(RANDOM() * 999999)::TEXT, 6, '0');
  RETURN cert_number;
END;
$$;

-- Trigger for updated_at on lessons
CREATE TRIGGER update_course_lessons_updated_at
  BEFORE UPDATE ON public.course_lessons
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();