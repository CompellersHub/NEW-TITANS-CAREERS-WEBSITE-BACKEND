-- Create enrollments table to track course purchases
CREATE TABLE public.enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_email TEXT NOT NULL,
  course_slug TEXT NOT NULL,
  course_title TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  stripe_session_id TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view enrollments (can be restricted later with auth)
CREATE POLICY "Anyone can view enrollments" 
ON public.enrollments 
FOR SELECT 
USING (true);

-- Create index on customer_email for faster lookups
CREATE INDEX idx_enrollments_customer_email ON public.enrollments(customer_email);

-- Create index on course_slug for faster lookups
CREATE INDEX idx_enrollments_course_slug ON public.enrollments(course_slug);