-- Add tags column to form_submissions table
ALTER TABLE public.form_submissions
ADD COLUMN tags text[] DEFAULT '{}';

-- Create index for better performance on tag queries
CREATE INDEX idx_form_submissions_tags ON public.form_submissions USING GIN(tags);

-- Create trigger to log tag changes
CREATE OR REPLACE FUNCTION public.log_form_submission_tags_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only log if tags actually changed
  IF OLD.tags IS DISTINCT FROM NEW.tags THEN
    INSERT INTO public.form_submission_audit_log (
      submission_id,
      changed_by,
      action_type,
      old_value,
      new_value
    ) VALUES (
      NEW.id,
      NEW.last_updated_by,
      'tags_changed',
      jsonb_build_object('tags', OLD.tags),
      jsonb_build_object('tags', NEW.tags)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER log_form_submission_tags_change
AFTER UPDATE ON public.form_submissions
FOR EACH ROW
EXECUTE FUNCTION public.log_form_submission_tags_change();