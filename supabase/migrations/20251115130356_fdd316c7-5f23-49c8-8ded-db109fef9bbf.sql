-- Create events table for cohort management
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  course_slug TEXT NOT NULL,
  event_type TEXT NOT NULL DEFAULT 'cohort', -- 'cohort', 'workshop', 'webinar'
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  cohort_number INTEGER,
  max_participants INTEGER DEFAULT 30,
  current_participants INTEGER DEFAULT 0,
  status TEXT DEFAULT 'upcoming', -- 'upcoming', 'ongoing', 'completed', 'cancelled'
  location TEXT DEFAULT 'online',
  instructor_name TEXT,
  price NUMERIC DEFAULT 0,
  image_url TEXT,
  registration_link TEXT,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  is_featured BOOLEAN DEFAULT false
);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Public can view active events
CREATE POLICY "Anyone can view active events"
  ON public.events
  FOR SELECT
  USING (status IN ('upcoming', 'ongoing'));

-- Admins can manage all events
CREATE POLICY "Admins can manage events"
  ON public.events
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for performance
CREATE INDEX idx_events_course_slug ON public.events(course_slug);
CREATE INDEX idx_events_start_date ON public.events(start_date);
CREATE INDEX idx_events_status ON public.events(status);

-- Create function to auto-generate cohort events
CREATE OR REPLACE FUNCTION generate_cohort_events(
  p_course_slug TEXT,
  p_course_title TEXT,
  p_months_ahead INTEGER DEFAULT 6
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_start_date DATE;
  v_cohort_num INTEGER;
  v_month_offset INTEGER;
BEGIN
  -- Get the highest cohort number for this course
  SELECT COALESCE(MAX(cohort_number), 0) INTO v_cohort_num
  FROM public.events
  WHERE course_slug = p_course_slug;
  
  -- Generate 2 cohorts per month for the next n months
  FOR v_month_offset IN 0..p_months_ahead LOOP
    -- First cohort: First Monday of the month
    v_start_date := date_trunc('month', CURRENT_DATE + (v_month_offset || ' months')::INTERVAL)::DATE;
    v_start_date := v_start_date + ((7 - EXTRACT(DOW FROM v_start_date)::INTEGER + 1) % 7);
    v_cohort_num := v_cohort_num + 1;
    
    INSERT INTO public.events (
      title,
      description,
      course_slug,
      event_type,
      start_date,
      end_date,
      cohort_number,
      status
    )
    VALUES (
      p_course_title || ' - Cohort ' || v_cohort_num,
      '8-week intensive training program',
      p_course_slug,
      'cohort',
      v_start_date,
      v_start_date + INTERVAL '8 weeks',
      v_cohort_num,
      CASE 
        WHEN v_start_date > CURRENT_DATE THEN 'upcoming'
        WHEN v_start_date <= CURRENT_DATE AND v_start_date + INTERVAL '8 weeks' > CURRENT_DATE THEN 'ongoing'
        ELSE 'completed'
      END
    )
    ON CONFLICT DO NOTHING;
    
    -- Second cohort: Third Monday of the month
    v_start_date := v_start_date + INTERVAL '2 weeks';
    v_cohort_num := v_cohort_num + 1;
    
    INSERT INTO public.events (
      title,
      description,
      course_slug,
      event_type,
      start_date,
      end_date,
      cohort_number,
      status
    )
    VALUES (
      p_course_title || ' - Cohort ' || v_cohort_num,
      '8-week intensive training program',
      p_course_slug,
      'cohort',
      v_start_date,
      v_start_date + INTERVAL '8 weeks',
      v_cohort_num,
      CASE 
        WHEN v_start_date > CURRENT_DATE THEN 'upcoming'
        WHEN v_start_date <= CURRENT_DATE AND v_start_date + INTERVAL '8 weeks' > CURRENT_DATE THEN 'ongoing'
        ELSE 'completed'
      END
    )
    ON CONFLICT DO NOTHING;
  END LOOP;
END;
$$;

-- Generate initial cohort events for all courses
SELECT generate_cohort_events('aml-kyc', 'AML/KYC Masterclass', 6);
SELECT generate_cohort_events('data-analysis', 'Data Analysis', 6);
SELECT generate_cohort_events('cybersecurity', 'Cybersecurity', 6);
SELECT generate_cohort_events('business-analysis', 'Business Analysis', 6);
SELECT generate_cohort_events('digital-marketing', 'Digital Marketing', 6);

-- Create function to update event status automatically
CREATE OR REPLACE FUNCTION update_event_status()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.events
  SET status = 'completed'
  WHERE status = 'ongoing' 
    AND end_date < CURRENT_DATE;
  
  UPDATE public.events
  SET status = 'ongoing'
  WHERE status = 'upcoming'
    AND start_date <= CURRENT_DATE
    AND end_date > CURRENT_DATE;
END;
$$;