-- Create a helper function to set runtime configuration
-- This allows the application to set session context for RLS policies
CREATE OR REPLACE FUNCTION public.set_config(setting text, value text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM set_config(setting, value, false);
END;
$$;