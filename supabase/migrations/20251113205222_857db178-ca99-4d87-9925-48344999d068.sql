-- Add assigned_to column to form_submissions table
ALTER TABLE public.form_submissions
ADD COLUMN assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create index for faster filtering by assigned_to
CREATE INDEX idx_form_submissions_assigned_to ON public.form_submissions(assigned_to);

-- Update the trigger to log assignment changes
CREATE OR REPLACE FUNCTION public.log_form_submission_assignment_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only log if assigned_to actually changed
  IF OLD.assigned_to IS DISTINCT FROM NEW.assigned_to THEN
    INSERT INTO public.form_submission_audit_log (
      submission_id,
      changed_by,
      action_type,
      old_value,
      new_value
    ) VALUES (
      NEW.id,
      NEW.last_updated_by,
      'assignment_changed',
      jsonb_build_object('assigned_to', OLD.assigned_to),
      jsonb_build_object('assigned_to', NEW.assigned_to)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for assignment changes
CREATE TRIGGER log_assignment_change
  BEFORE UPDATE ON public.form_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.log_form_submission_assignment_change();

-- Update RLS policy to allow admins to update assignments
DROP POLICY IF EXISTS "Admins can update submissions" ON public.form_submissions;
CREATE POLICY "Admins can update submissions"
ON public.form_submissions
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));