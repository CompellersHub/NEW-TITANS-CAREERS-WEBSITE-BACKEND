-- Drop existing function to recreate with correct dates
DROP FUNCTION IF EXISTS generate_cohort_events(text, integer);

-- Create updated function with correct cohort schedules
CREATE OR REPLACE FUNCTION generate_cohort_events(
  p_course_slug text,
  p_months_ahead integer DEFAULT 6
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_course_duration integer;
  v_base_start_date date;
  v_day_of_week text;
  v_course_title text;
  v_cohort_number integer := 1;
  v_start_date date;
  v_end_date date;
  v_max_date date;
BEGIN
  -- Set course-specific parameters based on the timetable
  CASE p_course_slug
    WHEN 'aml-kyc' THEN
      v_course_duration := 8;
      v_base_start_date := '2025-11-16'::date;
      v_day_of_week := 'Sunday';
      v_course_title := 'AML/KYC Compliance';
      
    WHEN 'data-analysis' THEN
      v_course_duration := 10;
      v_base_start_date := '2025-11-29'::date;
      v_day_of_week := 'Saturday';
      v_course_title := 'Data Analysis';
      
    WHEN 'business-analysis' THEN
      v_course_duration := 16;
      v_base_start_date := '2026-02-07'::date;
      v_day_of_week := 'Saturday';
      v_course_title := 'Business Analysis';
      
    WHEN 'cybersecurity' THEN
      v_course_duration := 12;
      v_base_start_date := '2025-12-07'::date;
      v_day_of_week := 'Sunday';
      v_course_title := 'Cybersecurity';
      
    WHEN 'data-privacy' THEN
      v_course_duration := 8;
      v_base_start_date := '2026-01-03'::date;
      v_day_of_week := 'Saturday';
      v_course_title := 'Data Privacy & GDPR';
      
    WHEN 'crypto-compliance' THEN
      v_course_duration := 8;
      v_base_start_date := '2026-01-04'::date;
      v_day_of_week := 'Sunday';
      v_course_title := 'Crypto & Digital Assets';
      
    WHEN 'digital-marketing' THEN
      v_course_duration := 8;
      v_base_start_date := '2026-01-10'::date;
      v_day_of_week := 'Saturday';
      v_course_title := 'Digital Marketing';
      
    ELSE
      RAISE EXCEPTION 'Unknown course slug: %', p_course_slug;
  END CASE;

  -- Calculate max date
  v_max_date := CURRENT_DATE + (p_months_ahead || ' months')::interval;

  -- Delete future events for this course (keep ongoing/past)
  DELETE FROM events 
  WHERE course_slug = p_course_slug 
    AND start_date > CURRENT_DATE
    AND event_type = 'cohort';

  -- Generate cohorts (6 cohorts, 4 weeks apart)
  FOR i IN 1..6 LOOP
    v_start_date := v_base_start_date + ((i - 1) * 28);
    v_end_date := v_start_date + ((v_course_duration - 1) * 7);
    
    -- Insert cohort event
    INSERT INTO events (
      course_slug,
      title,
      description,
      start_date,
      end_date,
      event_type,
      cohort_number,
      status,
      location,
      instructor_name,
      max_participants,
      metadata
    ) VALUES (
      p_course_slug,
      v_course_title || ' - Cohort ' || i,
      v_course_duration || ' weeks intensive training program. Live sessions every ' || v_day_of_week || ', 7-9pm UK time.',
      v_start_date,
      v_end_date,
      'cohort',
      i,
      CASE 
        WHEN v_start_date > CURRENT_DATE THEN 'upcoming'
        WHEN v_start_date <= CURRENT_DATE AND v_end_date >= CURRENT_DATE THEN 'ongoing'
        ELSE 'completed'
      END,
      'online',
      'Titans Careers Instructor Team',
      30,
      jsonb_build_object(
        'session_day', v_day_of_week,
        'session_time', '7:00pm-9:00pm UK',
        'timezone', 'Europe/London',
        'duration_weeks', v_course_duration
      )
    );
  END LOOP;

  RAISE NOTICE 'Generated 6 cohorts for % starting from %', p_course_slug, v_base_start_date;
END;
$$;