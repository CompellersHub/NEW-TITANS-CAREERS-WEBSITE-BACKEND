-- Add rate limiting table for inquiry spam prevention
CREATE TABLE IF NOT EXISTS inquiry_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL,
  inquiry_count integer DEFAULT 1,
  first_attempt_at timestamptz DEFAULT now(),
  last_attempt_at timestamptz DEFAULT now(),
  blocked_until timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier ON inquiry_rate_limits(identifier);
CREATE INDEX IF NOT EXISTS idx_rate_limits_blocked ON inquiry_rate_limits(blocked_until) WHERE blocked_until IS NOT NULL;

-- Add admin management columns to course_inquiries
ALTER TABLE course_inquiries
ADD COLUMN IF NOT EXISTS admin_notes text,
ADD COLUMN IF NOT EXISTS contacted_at timestamptz,
ADD COLUMN IF NOT EXISTS contacted_by uuid,
ADD COLUMN IF NOT EXISTS completed_at timestamptz;

-- Add index for status filtering
CREATE INDEX IF NOT EXISTS idx_course_inquiries_status ON course_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_course_inquiries_created_at ON course_inquiries(created_at DESC);

-- Enable RLS on inquiry_rate_limits
ALTER TABLE inquiry_rate_limits ENABLE ROW LEVEL SECURITY;

-- System can manage rate limits
CREATE POLICY "System can manage rate limits"
  ON inquiry_rate_limits FOR ALL
  USING (true)
  WITH CHECK (true);

-- Admins can update inquiries
CREATE POLICY "Admins can update inquiry status and notes"
  ON course_inquiries FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );