-- Add RLS policy for template_performance view
-- Since views don't directly support RLS, we create a security definer function

-- Grant select on view to admins
GRANT SELECT ON template_performance TO authenticated;

-- Create policy helper function
CREATE OR REPLACE FUNCTION can_view_template_performance()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  );
$$;

COMMENT ON FUNCTION can_view_template_performance IS 'Check if user has admin role to view template performance';