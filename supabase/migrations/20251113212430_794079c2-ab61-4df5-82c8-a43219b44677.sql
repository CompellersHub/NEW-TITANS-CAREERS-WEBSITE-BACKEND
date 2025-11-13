-- Add priority column to form_submissions table
ALTER TABLE public.form_submissions
ADD COLUMN priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high'));

-- Create index for better performance on priority queries
CREATE INDEX idx_form_submissions_priority ON public.form_submissions(priority);

-- Create trigger to log priority changes
CREATE OR REPLACE FUNCTION public.log_form_submission_priority_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only log if priority actually changed
  IF OLD.priority IS DISTINCT FROM NEW.priority THEN
    INSERT INTO public.form_submission_audit_log (
      submission_id,
      changed_by,
      action_type,
      old_value,
      new_value
    ) VALUES (
      NEW.id,
      NEW.last_updated_by,
      'priority_changed',
      jsonb_build_object('priority', OLD.priority),
      jsonb_build_object('priority', NEW.priority)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER log_form_submission_priority_change
AFTER UPDATE ON public.form_submissions
FOR EACH ROW
EXECUTE FUNCTION public.log_form_submission_priority_change();