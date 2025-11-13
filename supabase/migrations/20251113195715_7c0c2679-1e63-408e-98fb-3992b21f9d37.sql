-- Add status and admin notes columns to form_submissions table
ALTER TABLE public.form_submissions 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved', 'archived')),
ADD COLUMN IF NOT EXISTS admin_notes text,
ADD COLUMN IF NOT EXISTS last_updated_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS last_updated_at timestamp with time zone DEFAULT now();

-- Create index for status filtering
CREATE INDEX IF NOT EXISTS idx_form_submissions_status ON public.form_submissions(status);

-- Create trigger to update last_updated_at
CREATE OR REPLACE FUNCTION update_form_submission_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_form_submissions_timestamp
BEFORE UPDATE ON public.form_submissions
FOR EACH ROW
EXECUTE FUNCTION update_form_submission_timestamp();