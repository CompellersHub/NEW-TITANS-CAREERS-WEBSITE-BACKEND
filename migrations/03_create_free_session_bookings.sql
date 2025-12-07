-- Create free_session_bookings table
-- This table stores all free consultation session booking requests

CREATE TABLE IF NOT EXISTS free_session_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp_number TEXT NOT NULL,
  course_id UUID REFERENCES courses(id),
  course_slug TEXT NOT NULL,
  course_title TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'scheduled', 'completed', 'cancelled')),
  admin_notes TEXT,
  contacted_by UUID,
  contacted_at TIMESTAMP WITH TIME ZONE,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX idx_free_session_bookings_email ON free_session_bookings(email);
CREATE INDEX idx_free_session_bookings_status ON free_session_bookings(status);
CREATE INDEX idx_free_session_bookings_course_slug ON free_session_bookings(course_slug);
CREATE INDEX idx_free_session_bookings_created_at ON free_session_bookings(created_at DESC);

-- Add comment to table
COMMENT ON TABLE free_session_bookings IS 'Stores free consultation session booking requests from potential students';
