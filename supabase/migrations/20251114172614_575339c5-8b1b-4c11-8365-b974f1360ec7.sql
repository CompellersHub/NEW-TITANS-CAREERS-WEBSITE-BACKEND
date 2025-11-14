-- Fix form_submissions admin authorization - use server-side role validation
DROP POLICY IF EXISTS "Admins can view all submissions" ON public.form_submissions;

CREATE POLICY "Admins can view all submissions"
  ON public.form_submissions FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));