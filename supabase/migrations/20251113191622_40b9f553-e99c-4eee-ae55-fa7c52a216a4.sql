-- Create form_submissions table for storing contact form data
CREATE TABLE IF NOT EXISTS public.form_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  form_type TEXT NOT NULL,
  form_data JSONB NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert form submissions (public form)
CREATE POLICY "Anyone can submit forms"
  ON public.form_submissions
  FOR INSERT
  WITH CHECK (true);

-- Create policy for admin to view all submissions
CREATE POLICY "Admins can view all submissions"
  ON public.form_submissions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = auth.users.id
      AND auth.users.email IN (
        SELECT email FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
      )
    )
  );

-- Create index for faster queries
CREATE INDEX idx_form_submissions_type ON public.form_submissions(form_type);
CREATE INDEX idx_form_submissions_submitted_at ON public.form_submissions(submitted_at DESC);