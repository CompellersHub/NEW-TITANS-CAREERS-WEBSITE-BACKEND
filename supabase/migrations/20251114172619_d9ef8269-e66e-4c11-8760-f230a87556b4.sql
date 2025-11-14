-- Fix integration_tokens RLS policies
-- Users can read their own tokens for SSO
CREATE POLICY "Users can read own tokens"
  ON public.integration_tokens FOR SELECT
  TO authenticated
  USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Service role can manage all tokens (for edge functions)
CREATE POLICY "Service role can manage tokens"
  ON public.integration_tokens FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);