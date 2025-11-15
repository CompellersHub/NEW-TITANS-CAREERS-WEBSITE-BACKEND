-- Add archived_at field to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS archived_at timestamp with time zone;

-- Create index for efficient status queries
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_end_date ON events(end_date);

-- Function to archive expired events (24 hours after end_date)
CREATE OR REPLACE FUNCTION archive_expired_events()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE events
  SET 
    status = 'archived',
    archived_at = now(),
    updated_at = now()
  WHERE 
    status = 'completed'
    AND end_date < (now() - interval '24 hours')
    AND archived_at IS NULL;
END;
$$;

-- Function to maintain cohort pipeline (ensures 2 upcoming cohorts per course)
CREATE OR REPLACE FUNCTION maintain_cohort_pipeline()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  course_record RECORD;
  upcoming_count INTEGER;
  last_cohort_number INTEGER;
  last_end_date TIMESTAMP WITH TIME ZONE;
  new_start_date TIMESTAMP WITH TIME ZONE;
  new_end_date TIMESTAMP WITH TIME ZONE;
  i INTEGER;
BEGIN
  -- Loop through each course
  FOR course_record IN 
    SELECT DISTINCT course_slug FROM events WHERE event_type = 'cohort'
  LOOP
    -- Count upcoming cohorts for this course
    SELECT COUNT(*) INTO upcoming_count
    FROM events
    WHERE course_slug = course_record.course_slug
      AND event_type = 'cohort'
      AND status IN ('upcoming', 'ongoing')
      AND start_date >= now();
    
    -- If fewer than 2 upcoming cohorts, generate more
    IF upcoming_count < 2 THEN
      -- Get the last cohort number and end date
      SELECT COALESCE(MAX(cohort_number), 0), MAX(end_date)
      INTO last_cohort_number, last_end_date
      FROM events
      WHERE course_slug = course_record.course_slug
        AND event_type = 'cohort';
      
      -- Generate cohorts to bring total to 2 upcoming
      FOR i IN 1..(2 - upcoming_count) LOOP
        last_cohort_number := last_cohort_number + 1;
        
        -- Calculate new dates (8 weeks duration, start 2 weeks after previous ends)
        IF last_end_date IS NULL THEN
          new_start_date := now() + interval '2 weeks';
        ELSE
          new_start_date := last_end_date + interval '2 weeks';
        END IF;
        
        new_end_date := new_start_date + interval '8 weeks';
        
        -- Insert new cohort event
        INSERT INTO events (
          title,
          course_slug,
          event_type,
          start_date,
          end_date,
          status,
          cohort_number,
          description,
          location,
          max_participants,
          current_participants
        )
        VALUES (
          'Cohort ' || last_cohort_number,
          course_record.course_slug,
          'cohort',
          new_start_date,
          new_end_date,
          'upcoming',
          last_cohort_number,
          'Join our ' || course_record.course_slug || ' cohort for an intensive 8-week learning experience.',
          'online',
          30,
          0
        );
        
        last_end_date := new_end_date;
      END LOOP;
    END IF;
  END LOOP;
END;
$$;

-- Function for admin to manually refresh cohorts for a specific course
CREATE OR REPLACE FUNCTION refresh_course_cohorts(
  p_course_slug TEXT,
  p_months_ahead INTEGER DEFAULT 6
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  last_cohort_number INTEGER;
  new_start_date TIMESTAMP WITH TIME ZONE;
  new_end_date TIMESTAMP WITH TIME ZONE;
  cohorts_to_generate INTEGER;
  i INTEGER;
BEGIN
  -- Get the last cohort number
  SELECT COALESCE(MAX(cohort_number), 0)
  INTO last_cohort_number
  FROM events
  WHERE course_slug = p_course_slug
    AND event_type = 'cohort';
  
  -- Calculate how many cohorts to generate (roughly 1 cohort every 10 weeks)
  cohorts_to_generate := CEIL(p_months_ahead / 2.5);
  
  -- Start from 2 weeks from now
  new_start_date := now() + interval '2 weeks';
  
  -- Generate cohorts
  FOR i IN 1..cohorts_to_generate LOOP
    last_cohort_number := last_cohort_number + 1;
    new_end_date := new_start_date + interval '8 weeks';
    
    INSERT INTO events (
      title,
      course_slug,
      event_type,
      start_date,
      end_date,
      status,
      cohort_number,
      description,
      location,
      max_participants,
      current_participants
    )
    VALUES (
      'Cohort ' || last_cohort_number,
      p_course_slug,
      'cohort',
      new_start_date,
      new_end_date,
      'upcoming',
      last_cohort_number,
      'Join our ' || p_course_slug || ' cohort for an intensive 8-week learning experience.',
      'online',
      30,
      0
    );
    
    -- Next cohort starts 2 weeks after this one ends
    new_start_date := new_end_date + interval '2 weeks';
  END LOOP;
END;
$$;