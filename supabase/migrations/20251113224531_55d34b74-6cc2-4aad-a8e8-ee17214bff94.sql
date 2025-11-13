-- Create voucher_distributions table to track email sends
CREATE TABLE IF NOT EXISTS public.voucher_distributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_id UUID NOT NULL REFERENCES public.vouchers(id) ON DELETE CASCADE,
  segment_id UUID REFERENCES public.subscriber_segments(id) ON DELETE SET NULL,
  recipient_count INTEGER NOT NULL DEFAULT 0,
  distributed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  distribution_method TEXT NOT NULL CHECK (distribution_method IN ('manual', 'segment', 'bulk')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.voucher_distributions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can view all distributions"
  ON public.voucher_distributions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can create distributions"
  ON public.voucher_distributions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Create index for performance
CREATE INDEX idx_voucher_distributions_voucher_id ON public.voucher_distributions(voucher_id);
CREATE INDEX idx_voucher_distributions_created_at ON public.voucher_distributions(created_at DESC);
