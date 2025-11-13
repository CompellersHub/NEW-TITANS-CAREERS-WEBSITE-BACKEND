-- Create enum for discount types
CREATE TYPE public.discount_type AS ENUM ('percentage', 'fixed_amount');

-- Create vouchers table
CREATE TABLE public.vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  discount_type public.discount_type NOT NULL,
  discount_value NUMERIC NOT NULL CHECK (discount_value > 0),
  min_purchase_amount NUMERIC,
  max_discount_amount NUMERIC,
  valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
  valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
  usage_limit INTEGER,
  usage_count INTEGER NOT NULL DEFAULT 0,
  per_user_limit INTEGER,
  applicable_courses TEXT[],
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_dates CHECK (valid_until > valid_from),
  CONSTRAINT valid_discount_percentage CHECK (
    discount_type != 'percentage' OR (discount_value >= 0 AND discount_value <= 100)
  )
);

-- Create voucher_usage table
CREATE TABLE public.voucher_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_id UUID NOT NULL REFERENCES public.vouchers(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  course_slug TEXT NOT NULL,
  original_price NUMERIC NOT NULL,
  discount_amount NUMERIC NOT NULL,
  final_price NUMERIC NOT NULL,
  stripe_session_id TEXT,
  used_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX idx_vouchers_code ON public.vouchers(code);
CREATE INDEX idx_vouchers_active ON public.vouchers(is_active);
CREATE INDEX idx_vouchers_valid_dates ON public.vouchers(valid_from, valid_until);
CREATE INDEX idx_voucher_usage_voucher_id ON public.voucher_usage(voucher_id);
CREATE INDEX idx_voucher_usage_email ON public.voucher_usage(user_email);

-- Enable RLS
ALTER TABLE public.vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voucher_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vouchers
CREATE POLICY "Admins can manage all vouchers"
  ON public.vouchers
  FOR ALL
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view active vouchers for validation"
  ON public.vouchers
  FOR SELECT
  USING (is_active = true);

-- RLS Policies for voucher_usage
CREATE POLICY "Admins can view all voucher usage"
  ON public.voucher_usage
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert voucher usage"
  ON public.voucher_usage
  FOR INSERT
  WITH CHECK (true);

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_vouchers_updated_at
  BEFORE UPDATE ON public.vouchers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();