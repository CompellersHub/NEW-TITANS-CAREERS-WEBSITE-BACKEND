-- Update cohort naming to handle multiple cohorts per month

DROP FUNCTION IF EXISTS maintain_cohort_pipeline();

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
  month_name TEXT;
  cohort_suffix TEXT;
  courses_processed INTEGER := 0;
  cohorts_created INTEGER := 0;
  result JSONB;
  course_config JSONB;
  duration_weeks INTEGER;
  day_of_week TEXT;
  session_time TEXT;
  existing_in_month INTEGER;
BEGIN
  course_config := '{
    "aml-kyc": {"duration": 8, "day": "Sunday", "displayName": "AML/KYC Compliance", "time": "Evening session"},
    "data-analysis": {"duration": 10, "day": "Saturday", "displayName": "Data Analysis", "time": "Evening session"},
    "cybersecurity": {"duration": 12, "day": "Sunday", "displayName": "Cybersecurity", "time": "Evening session"},
    "data-privacy": {"duration": 8, "day": "Saturday", "displayName": "Data Privacy & GDPR", "time": "Evening session"},
    "crypto-compliance": {"duration": 8, "day": "Sunday", "displayName": "Crypto & Digital Assets", "time": "Evening session"},
    "digital-marketing": {"duration": 8, "day": "Saturday", "displayName": "Digital Marketing", "time": "Evening session"},
    "business-analysis": {"duration": 16, "day": "Saturday", "displayName": "Business Analysis", "time": "Afternoon session"}
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
        session_time := course_config->course_record.course_slug->>'time';
        
        new_start_date := last_cohort_record.start_date + INTERVAL '4 weeks';
        new_end_date := new_start_date + (duration_weeks || ' weeks')::INTERVAL;
        next_cohort_number := COALESCE(last_cohort_record.cohort_number, 0) + 1;
        
        -- Get month name from start date
        month_name := TRIM(TO_CHAR(new_start_date, 'Month'));
        
        -- Check if there's already a cohort in this month for this course
        SELECT COUNT(*) INTO existing_in_month
        FROM events
        WHERE course_slug = course_record.course_slug
          AND event_type = 'cohort'
          AND EXTRACT(MONTH FROM start_date) = EXTRACT(MONTH FROM new_start_date)
          AND EXTRACT(YEAR FROM start_date) = EXTRACT(YEAR FROM new_start_date);
        
        -- Determine suffix based on existing cohorts in month
        IF existing_in_month = 0 THEN
          cohort_suffix := ' Cohort';
        ELSE
          cohort_suffix := ' - Late';
        END IF;
        
        INSERT INTO events (
          title, description, course_slug, event_type, start_date, end_date,
          cohort_number, max_participants, current_participants, status,
          location, instructor_name, price, metadata
        ) VALUES (
          (course_config->course_record.course_slug->>'displayName') || ' - ' || month_name || cohort_suffix,
          duration_weeks || ' weeks intensive training program. ' || session_time || ' every ' || day_of_week || '.',
          course_record.course_slug, 'cohort', new_start_date, new_end_date,
          next_cohort_number, 30, 0,
          CASE WHEN new_start_date <= NOW() THEN 'ongoing' ELSE 'upcoming' END,
          'online', 'Titans Careers Instructor Team', 0,
          jsonb_build_object(
            'timezone', 'Europe/London',
            'session_day', day_of_week,
            'session_time', session_time,
            'duration_weeks', duration_weeks,
            'month_name', month_name,
            'cohort_suffix', cohort_suffix
          )
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