-- Create role_audit_log table for tracking role changes
CREATE TABLE IF NOT EXISTS public.role_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL CHECK (action IN ('grant_role', 'revoke_role')),
  target_user_id UUID NOT NULL,
  target_role app_role NOT NULL,
  performed_by UUID NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.role_audit_log ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to view audit logs
CREATE POLICY "Admins can view role audit logs"
  ON public.role_audit_log
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Create policy for system to insert audit logs
CREATE POLICY "System can insert role audit logs"
  ON public.role_audit_log
  FOR INSERT
  WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_role_audit_log_target_user ON public.role_audit_log(target_user_id);
CREATE INDEX IF NOT EXISTS idx_role_audit_log_performed_by ON public.role_audit_log(performed_by);
CREATE INDEX IF NOT EXISTS idx_role_audit_log_created_at ON public.role_audit_log(created_at DESC);