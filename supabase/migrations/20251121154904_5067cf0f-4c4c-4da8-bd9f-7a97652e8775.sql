-- Fix security warnings: Set search_path for functions

DROP FUNCTION IF EXISTS maintain_cohort_pipeline();
DROP FUNCTION IF EXISTS update_event_status();
DROP FUNCTION IF EXISTS archive_expired_events();

-- Function to automatically maintain cohort pipeline with secure search_path
CREATE FUNCTION maintain_cohort_pipeline()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  course_record RECORD;
  last_cohort_record RECORD;
  new_start_date TIMESTAMP WITH TIME ZONE;
  new_end_date TIMESTAMP WITH TIME ZONE;
  next_cohort_number INTEGER;
  courses_processed INTEGER := 0;
  cohorts_created INTEGER := 0;
  result JSONB;
  course_config JSONB;
  duration_weeks INTEGER;
  day_of_week TEXT;
BEGIN
  course_config := '{
    "aml-kyc": {"duration": 8, "day": "Sunday", "displayName": "AML/KYC Compliance"},
    "data-analysis": {"duration": 10, "day": "Saturday", "displayName": "Data Analysis"},
    "cybersecurity": {"duration": 12, "day": "Sunday", "displayName": "Cybersecurity"},
    "data-privacy": {"duration": 8, "day": "Saturday", "displayName": "Data Privacy & GDPR"},
    "crypto-compliance": {"duration": 8, "day": "Sunday", "displayName": "Crypto & Digital Assets"},
    "digital-marketing": {"duration": 8, "day": "Saturday", "displayName": "Digital Marketing"},
    "business-analysis": {"duration": 16, "day": "Saturday", "displayName": "Business Analysis"}
  }'::JSONB;

  FOR course_record IN 
    SELECT DISTINCT course_slug 
    FROM events 
    WHERE event_type = 'cohort'
  LOOP
    courses_processed := courses_processed + 1;
    
    DECLARE
      upcoming_count INTEGER;
    BEGIN
      SELECT COUNT(*) INTO upcoming_count
      FROM events
      WHERE course_slug = course_record.course_slug
        AND event_type = 'cohort'
        AND status IN ('upcoming', 'ongoing')
        AND start_date >= NOW();
      
      WHILE upcoming_count < 2 LOOP
        SELECT * INTO last_cohort_record
        FROM events
        WHERE course_slug = course_record.course_slug
          AND event_type = 'cohort'
        ORDER BY cohort_number DESC, start_date DESC
        LIMIT 1;
        
        duration_weeks := (course_config->course_record.course_slug->>'duration')::INTEGER;
        day_of_week := course_config->course_record.course_slug->>'day';
        
        new_start_date := last_cohort_record.start_date + INTERVAL '4 weeks';
        new_end_date := new_start_date + (duration_weeks || ' weeks')::INTERVAL;
        next_cohort_number := COALESCE(last_cohort_record.cohort_number, 0) + 1;
        
        INSERT INTO events (
          title, description, course_slug, event_type, start_date, end_date,
          cohort_number, max_participants, current_participants, status,
          location, instructor_name, price, metadata
        ) VALUES (
          (course_config->course_record.course_slug->>'displayName') || ' - Cohort ' || next_cohort_number,
          duration_weeks || ' weeks intensive training program. Live sessions every ' || day_of_week || ', 7-9pm UK time.',
          course_record.course_slug, 'cohort', new_start_date, new_end_date,
          next_cohort_number, 30, 0,
          CASE WHEN new_start_date <= NOW() THEN 'ongoing' ELSE 'upcoming' END,
          'online', 'Titans Careers Instructor Team', 0,
          jsonb_build_object('timezone', 'Europe/London', 'session_day', day_of_week,
            'session_time', '7:00pm-9:00pm UK', 'duration_weeks', duration_weeks)
        );
        
        cohorts_created := cohorts_created + 1;
        upcoming_count := upcoming_count + 1;
        
        SELECT * INTO last_cohort_record
        FROM events
        WHERE course_slug = course_record.course_slug
          AND event_type = 'cohort'
        ORDER BY cohort_number DESC, start_date DESC
        LIMIT 1;
      END LOOP;
    END;
  END LOOP;

  result := jsonb_build_object(
    'success', true, 'courses_processed', courses_processed,
    'cohorts_created', cohorts_created, 'timestamp', NOW()
  );

  RETURN result;
END;
$$;

-- Function to update event statuses with secure search_path
CREATE FUNCTION update_event_status()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE events
  SET status = 'ongoing'
  WHERE status = 'upcoming'
    AND start_date <= NOW()
    AND (end_date IS NULL OR end_date >= NOW());

  UPDATE events
  SET status = 'completed'
  WHERE status IN ('upcoming', 'ongoing')
    AND end_date IS NOT NULL
    AND end_date < NOW();
END;
$$;

-- Function to archive old completed events with secure search_path
CREATE FUNCTION archive_expired_events()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE events
  SET status = 'archived', archived_at = NOW()
  WHERE status = 'completed'
    AND end_date < (NOW() - INTERVAL '24 hours')
    AND archived_at IS NULL;
END;
$$;