-- Create app role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create index for faster role lookups
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);

-- Enable Row Level Security
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check if user has a role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Only admins can view user roles
CREATE POLICY "Admins can view all user roles"
ON public.user_roles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can manage user roles
CREATE POLICY "Admins can manage user roles"
ON public.user_roles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Update newsletter_subscribers policies for admin access
DROP POLICY IF EXISTS "Only authenticated users can view subscribers" ON public.newsletter_subscribers;

-- Admins can view all subscribers
CREATE POLICY "Admins can view all subscribers"
ON public.newsletter_subscribers
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update subscribers (for unsubscribe management)
CREATE POLICY "Admins can update subscribers"
ON public.newsletter_subscribers
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can delete subscribers
CREATE POLICY "Admins can delete subscribers"
ON public.newsletter_subscribers
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Add comment
COMMENT ON TABLE public.user_roles IS 'Stores user role assignments for access control';
COMMENT ON FUNCTION public.has_role IS 'Security definer function to check if a user has a specific role without causing RLS recursion';
