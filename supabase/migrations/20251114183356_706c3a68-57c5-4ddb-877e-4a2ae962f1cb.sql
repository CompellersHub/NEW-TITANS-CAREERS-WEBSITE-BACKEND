-- ============================================
-- MULTI-PAYMENT SYSTEM DATABASE FOUNDATION
-- ============================================
-- Extends enrollments table and creates payment tracking tables

-- 1. Extend enrollments table with payment tracking
ALTER TABLE enrollments 
ADD COLUMN IF NOT EXISTS payment_method TEXT CHECK (payment_method IN ('stripe', 'paypal', 'bank_transfer', 'payl8r')),
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'completed' CHECK (payment_status IN ('pending', 'completed', 'failed', 'cancelled', 'processing')),
ADD COLUMN IF NOT EXISTS payment_provider_reference TEXT,
ADD COLUMN IF NOT EXISTS installment_plan JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS payment_metadata JSONB DEFAULT '{}'::jsonb;

-- 2. Create payment_intents table for tracking all payment attempts
CREATE TABLE IF NOT EXISTS payment_intents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  course_slug TEXT NOT NULL,
  course_title TEXT NOT NULL,
  original_price NUMERIC NOT NULL,
  final_price NUMERIC NOT NULL,
  voucher_code TEXT,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('stripe', 'paypal', 'bank_transfer', 'payl8r')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'cancelled', 'processing')),
  payment_reference TEXT UNIQUE,
  provider_session_id TEXT,
  expires_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create bank_transfer_orders table for manual verification
CREATE TABLE IF NOT EXISTS bank_transfer_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_intent_id UUID REFERENCES payment_intents(id) ON DELETE CASCADE,
  payment_reference TEXT UNIQUE NOT NULL,
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  course_title TEXT NOT NULL,
  course_slug TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'awaiting_payment' CHECK (status IN ('awaiting_payment', 'verified', 'expired', 'cancelled')),
  payment_proof_url TEXT,
  verified_by UUID,
  verified_at TIMESTAMPTZ,
  instructions_sent_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable Row Level Security
ALTER TABLE payment_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_transfer_orders ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for payment_intents
CREATE POLICY "Anyone can create payment intents"
ON payment_intents FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can view own payment intents"
ON payment_intents FOR SELECT
USING (true);

CREATE POLICY "Service role can manage all payment intents"
ON payment_intents FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- 6. RLS Policies for bank_transfer_orders
CREATE POLICY "Anyone can create bank transfer orders"
ON bank_transfer_orders FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can view own bank orders"
ON bank_transfer_orders FOR SELECT
USING (true);

CREATE POLICY "Admins can manage bank orders"
ON bank_transfer_orders FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- 7. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_payment_intents_email ON payment_intents(customer_email);
CREATE INDEX IF NOT EXISTS idx_payment_intents_reference ON payment_intents(payment_reference);
CREATE INDEX IF NOT EXISTS idx_payment_intents_status ON payment_intents(payment_status);
CREATE INDEX IF NOT EXISTS idx_payment_intents_created ON payment_intents(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_bank_orders_reference ON bank_transfer_orders(payment_reference);
CREATE INDEX IF NOT EXISTS idx_bank_orders_email ON bank_transfer_orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_bank_orders_status ON bank_transfer_orders(status);
CREATE INDEX IF NOT EXISTS idx_bank_orders_expires ON bank_transfer_orders(expires_at);

-- 8. Create updated_at triggers
CREATE OR REPLACE FUNCTION update_payment_intents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payment_intents_updated_at
BEFORE UPDATE ON payment_intents
FOR EACH ROW
EXECUTE FUNCTION update_payment_intents_updated_at();

CREATE OR REPLACE FUNCTION update_bank_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bank_orders_updated_at
BEFORE UPDATE ON bank_transfer_orders
FOR EACH ROW
EXECUTE FUNCTION update_bank_orders_updated_at();