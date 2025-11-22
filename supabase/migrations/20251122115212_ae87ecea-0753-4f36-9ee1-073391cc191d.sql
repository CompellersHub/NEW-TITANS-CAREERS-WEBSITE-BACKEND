-- Drop and recreate the view as SECURITY INVOKER instead of SECURITY DEFINER
DROP VIEW IF EXISTS public.role_descriptions;

CREATE VIEW public.role_descriptions 
WITH (security_invoker = true)
AS
SELECT 
  'admin'::app_role as role,
  'Full system access, can manage all users and roles' as description,
  'red' as color_scheme
UNION ALL
SELECT 
  'developer'::app_role,
  'Can manage integrations, technical settings, and development features',
  'purple'
UNION ALL
SELECT 
  'support'::app_role,
  'Can manage content and handle user inquiries',
  'blue'
UNION ALL
SELECT 
  'marketer'::app_role,
  'Can manage campaigns and marketing content',
  'green';

-- Grant read access to authenticated users
GRANT SELECT ON public.role_descriptions TO authenticated;