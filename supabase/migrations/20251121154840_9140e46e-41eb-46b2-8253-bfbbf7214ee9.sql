-- Drop and recreate functions for automated cohort management

DROP FUNCTION IF EXISTS maintain_cohort_pipeline();
DROP FUNCTION IF EXISTS update_event_status();
DROP FUNCTION IF EXISTS archive_expired_events();

-- Function to automatically maintain cohort pipeline
-- Ensures each course always has at least 2 upcoming cohorts
-- Generates new cohorts 4 weeks after the last one
CREATE FUNCTION maintain_cohort_pipeline()
RETURNS jsonb
LANGUAGE plpgsql
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
  -- Course configurations
  course_config := '{
    "aml-kyc": {"duration": 8, "day": "Sunday", "displayName": "AML/KYC Compliance"},
    "data-analysis": {"duration": 10, "day": "Saturday", "displayName": "Data Analysis"},
    "cybersecurity": {"duration": 12, "day": "Sunday", "displayName": "Cybersecurity"},
    "data-privacy": {"duration": 8, "day": "Saturday", "displayName": "Data Privacy & GDPR"},
    "crypto-compliance": {"duration": 8, "day": "Sunday", "displayName": "Crypto & Digital Assets"},
    "digital-marketing": {"duration": 8, "day": "Saturday", "displayName": "Digital Marketing"},
    "business-analysis": {"duration": 16, "day": "Saturday", "displayName": "Business Analysis"}
  }'::JSONB;

  -- Iterate through each course
  FOR course_record IN 
    SELECT DISTINCT course_slug 
    FROM events 
    WHERE event_type = 'cohort'
  LOOP
    courses_processed := courses_processed + 1;
    
    -- Count upcoming cohorts for this course
    DECLARE
      upcoming_count INTEGER;
    BEGIN
      SELECT COUNT(*) INTO upcoming_count
      FROM events
      WHERE course_slug = course_record.course_slug
        AND event_type = 'cohort'
        AND status IN ('upcoming', 'ongoing')
        AND start_date >= NOW();
      
      -- If we have less than 2 upcoming cohorts, create more
      WHILE upcoming_count < 2 LOOP
        -- Get the last cohort for this course
        SELECT * INTO last_cohort_record
        FROM events
        WHERE course_slug = course_record.course_slug
          AND event_type = 'cohort'
        ORDER BY cohort_number DESC, start_date DESC
        LIMIT 1;
        
        -- Get course configuration
        duration_weeks := (course_config->course_record.course_slug->>'duration')::INTEGER;
        day_of_week := course_config->course_record.course_slug->>'day';
        
        -- Calculate new cohort dates (4 weeks after last cohort start)
        new_start_date := last_cohort_record.start_date + INTERVAL '4 weeks';
        new_end_date := new_start_date + (duration_weeks || ' weeks')::INTERVAL;
        next_cohort_number := COALESCE(last_cohort_record.cohort_number, 0) + 1;
        
        -- Create the new cohort
        INSERT INTO events (
          title,
          description,
          course_slug,
          event_type,
          start_date,
          end_date,
          cohort_number,
          max_participants,
          current_participants,
          status,
          location,
          instructor_name,
          price,
          metadata
        ) VALUES (
          (course_config->course_record.course_slug->>'displayName') || ' - Cohort ' || next_cohort_number,
          duration_weeks || ' weeks intensive training program. Live sessions every ' || day_of_week || ', 7-9pm UK time.',
          course_record.course_slug,
          'cohort',
          new_start_date,
          new_end_date,
          next_cohort_number,
          30,
          0,
          CASE 
            WHEN new_start_date <= NOW() THEN 'ongoing'
            ELSE 'upcoming'
          END,
          'online',
          'Titans Careers Instructor Team',
          0,
          jsonb_build_object(
            'timezone', 'Europe/London',
            'session_day', day_of_week,
            'session_time', '7:00pm-9:00pm UK',
            'duration_weeks', duration_weeks
          )
        );
        
        cohorts_created := cohorts_created + 1;
        upcoming_count := upcoming_count + 1;
        
        -- Refresh last_cohort_record for next iteration
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
    'success', true,
    'courses_processed', courses_processed,
    'cohorts_created', cohorts_created,
    'timestamp', NOW()
  );

  RETURN result;
END;
$$;

-- Function to update event statuses based on dates
CREATE FUNCTION update_event_status()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Update to ongoing if start date has passed
  UPDATE events
  SET status = 'ongoing'
  WHERE status = 'upcoming'
    AND start_date <= NOW()
    AND (end_date IS NULL OR end_date >= NOW());

  -- Update to completed if end date has passed
  UPDATE events
  SET status = 'completed'
  WHERE status IN ('upcoming', 'ongoing')
    AND end_date IS NOT NULL
    AND end_date < NOW();
END;
$$;

-- Function to archive old completed events
CREATE FUNCTION archive_expired_events()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Archive events that completed more than 24 hours ago
  UPDATE events
  SET 
    status = 'archived',
    archived_at = NOW()
  WHERE status = 'completed'
    AND end_date < (NOW() - INTERVAL '24 hours')
    AND archived_at IS NULL;
END;
$$;