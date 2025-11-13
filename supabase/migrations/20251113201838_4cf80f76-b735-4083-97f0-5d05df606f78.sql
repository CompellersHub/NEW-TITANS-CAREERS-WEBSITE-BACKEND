-- Create audit log table for form submissions
CREATE TABLE IF NOT EXISTS public.form_submission_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid REFERENCES public.form_submissions(id) ON DELETE CASCADE NOT NULL,
  changed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action_type text NOT NULL CHECK (action_type IN ('status_changed', 'notes_updated', 'created')),
  old_value jsonb,
  new_value jsonb,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.form_submission_audit_log ENABLE ROW LEVEL SECURITY;

-- Admins can view audit logs
CREATE POLICY "Admins can view audit logs"
ON public.form_submission_audit_log
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for faster lookups
CREATE INDEX idx_audit_log_submission ON public.form_submission_audit_log(submission_id, created_at DESC);
CREATE INDEX idx_audit_log_user ON public.form_submission_audit_log(changed_by);

-- Create function to log status changes
CREATE OR REPLACE FUNCTION log_form_submission_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only log if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.form_submission_audit_log (
      submission_id,
      changed_by,
      action_type,
      old_value,
      new_value
    ) VALUES (
      NEW.id,
      NEW.last_updated_by,
      'status_changed',
      jsonb_build_object('status', OLD.status),
      jsonb_build_object('status', NEW.status)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create function to log notes changes
CREATE OR REPLACE FUNCTION log_form_submission_notes_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only log if notes actually changed
  IF OLD.admin_notes IS DISTINCT FROM NEW.admin_notes THEN
    INSERT INTO public.form_submission_audit_log (
      submission_id,
      changed_by,
      action_type,
      old_value,
      new_value
    ) VALUES (
      NEW.id,
      NEW.last_updated_by,
      'notes_updated',
      jsonb_build_object('admin_notes', OLD.admin_notes),
      jsonb_build_object('admin_notes', NEW.admin_notes)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create function to log new submissions
CREATE OR REPLACE FUNCTION log_form_submission_creation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.form_submission_audit_log (
    submission_id,
    changed_by,
    action_type,
    old_value,
    new_value
  ) VALUES (
    NEW.id,
    NULL, -- No user for system-created entries
    'created',
    NULL,
    jsonb_build_object(
      'form_type', NEW.form_type,
      'status', NEW.status
    )
  );
  
  RETURN NEW;
END;
$$;

-- Create triggers for audit logging
CREATE TRIGGER form_submission_status_audit
AFTER UPDATE ON public.form_submissions
FOR EACH ROW
EXECUTE FUNCTION log_form_submission_status_change();

CREATE TRIGGER form_submission_notes_audit
AFTER UPDATE ON public.form_submissions
FOR EACH ROW
EXECUTE FUNCTION log_form_submission_notes_change();

CREATE TRIGGER form_submission_creation_audit
AFTER INSERT ON public.form_submissions
FOR EACH ROW
EXECUTE FUNCTION log_form_submission_creation();