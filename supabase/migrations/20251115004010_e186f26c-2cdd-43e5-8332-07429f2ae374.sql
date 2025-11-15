-- Create storage bucket for payment proofs
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'payment-proofs',
  'payment-proofs',
  false,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'application/pdf']
);

-- Create RLS policies for payment-proofs bucket
CREATE POLICY "Anyone can upload payment proofs"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'payment-proofs');

CREATE POLICY "Users can view their own payment proofs"
ON storage.objects FOR SELECT
USING (bucket_id = 'payment-proofs');

CREATE POLICY "Admins can view all payment proofs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'payment-proofs' AND
  auth.jwt() ->> 'email' IN (
    SELECT email FROM admin_notification_preferences
  )
);

-- Update bank_transfer_orders to support multiple proof URLs
ALTER TABLE bank_transfer_orders 
ADD COLUMN IF NOT EXISTS payment_proof_urls TEXT[] DEFAULT ARRAY[]::TEXT[];

COMMENT ON COLUMN bank_transfer_orders.payment_proof_urls IS 'Array of URLs for multiple payment proof documents';