-- Fix critical security vulnerability: Replace client-controlled metadata check with server-side role validation
-- This prevents privilege escalation attacks where users could manipulate raw_user_meta_data

-- Drop the insecure policy that uses raw_user_meta_data
DROP POLICY IF EXISTS "Admins can view all submissions" ON public.form_submissions;

-- Create secure policy using the has_role() security definer function
-- This validates roles through the user_roles table on the server side
CREATE POLICY "Admins can view all submissions"
  ON public.form_submissions
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));