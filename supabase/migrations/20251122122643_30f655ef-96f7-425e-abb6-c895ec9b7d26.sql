-- Seed initial cohorts for all courses (2 per course, 6 weeks apart)
-- Only insert if cohorts don't already exist for that course

DO $$
DECLARE
  v_courses text[] := ARRAY['aml-kyc', 'crypto-compliance', 'data-privacy', 'data-analysis', 'cybersecurity', 'business-analysis', 'digital-marketing'];
  v_course text;
  v_course_config jsonb;
  v_start_date date;
  v_end_date date;
  v_cohort_count int;
BEGIN
  FOREACH v_course IN ARRAY v_courses
  LOOP
    -- Check if course already has upcoming cohorts
    SELECT COUNT(*) INTO v_cohort_count
    FROM public.events
    WHERE course_slug = v_course
      AND event_type = 'cohort'
      AND status IN ('upcoming', 'ongoing')
      AND start_date >= CURRENT_DATE;
    
    -- Only create cohorts if less than 2 exist
    IF v_cohort_count < 2 THEN
      -- Set course-specific configuration
      v_course_config := CASE v_course
        WHEN 'data-analysis' THEN jsonb_build_object(
          'display_name', 'Data Analysis & Visualization',
          'day_of_week', 3, -- Wednesday
          'session_time', '7-9pm UK',
          'duration_weeks', 8
        )
        WHEN 'aml-kyc' THEN jsonb_build_object(
          'display_name', 'AML/KYC Compliance',
          'day_of_week', 5, -- Friday
          'session_time', '7-9pm UK',
          'duration_weeks', 8
        )
        WHEN 'cybersecurity' THEN jsonb_build_object(
          'display_name', 'Cybersecurity Fundamentals',
          'day_of_week', 0, -- Sunday
          'session_time', '6-8pm UK',
          'duration_weeks', 10
        )
        WHEN 'business-analysis' THEN jsonb_build_object(
          'display_name', 'Business Analysis',
          'day_of_week', 0, -- Sunday
          'session_time', '4-6pm UK',
          'duration_weeks', 8
        )
        WHEN 'crypto-compliance' THEN jsonb_build_object(
          'display_name', 'Crypto Compliance',
          'day_of_week', 6, -- Saturday
          'session_time', '10am-12pm UK',
          'duration_weeks', 6
        )
        WHEN 'data-privacy' THEN jsonb_build_object(
          'display_name', 'Data Privacy & GDPR',
          'day_of_week', 6, -- Saturday
          'session_time', '2-4pm UK',
          'duration_weeks', 6
        )
        WHEN 'digital-marketing' THEN jsonb_build_object(
          'display_name', 'Digital Marketing',
          'day_of_week', 2, -- Tuesday
          'session_time', '7-9pm UK',
          'duration_weeks', 8
        )
      END;
      
      -- Calculate next occurrence of the course's day of week
      v_start_date := CURRENT_DATE + 
        ((v_course_config->>'day_of_week')::int - EXTRACT(DOW FROM CURRENT_DATE)::int + 7)::int % 7;
      
      -- If that date is too soon (less than 7 days), move to next week
      IF v_start_date - CURRENT_DATE < 7 THEN
        v_start_date := v_start_date + 7;
      END IF;
      
      v_end_date := v_start_date + ((v_course_config->>'duration_weeks')::int * 7);
      
      -- Insert Cohort 1 (if needed)
      IF v_cohort_count = 0 THEN
        INSERT INTO public.events (
          course_slug,
          event_type,
          title,
          description,
          start_date,
          end_date,
          status,
          location,
          cohort_number,
          metadata
        ) VALUES (
          v_course,
          'cohort',
          (v_course_config->>'display_name') || ' - ' || TO_CHAR(v_start_date, 'Month') || ' Cohort',
          'Intensive ' || (v_course_config->>'duration_weeks') || '-week masterclass with hands-on projects, expert mentorship, and industry-recognized certification.',
          v_start_date,
          v_end_date,
          'upcoming',
          'online',
          1,
          jsonb_build_object(
            'duration_weeks', (v_course_config->>'duration_weeks')::int,
            'session_day', CASE (v_course_config->>'day_of_week')::int
              WHEN 0 THEN 'Sunday'
              WHEN 1 THEN 'Monday'
              WHEN 2 THEN 'Tuesday'
              WHEN 3 THEN 'Wednesday'
              WHEN 4 THEN 'Thursday'
              WHEN 5 THEN 'Friday'
              WHEN 6 THEN 'Saturday'
            END,
            'session_time', v_course_config->>'session_time',
            'month_name', TO_CHAR(v_start_date, 'Month'),
            'cohort_suffix', ' Cohort'
          )
        );
        
        RAISE NOTICE 'Created Cohort 1 for % starting %', v_course, v_start_date;
      END IF;
      
      -- Calculate Cohort 2 dates (6 weeks after Cohort 1)
      v_start_date := v_start_date + 42; -- 6 weeks
      v_end_date := v_start_date + ((v_course_config->>'duration_weeks')::int * 7);
      
      -- Insert Cohort 2 (always if we're in this block)
      INSERT INTO public.events (
        course_slug,
        event_type,
        title,
        description,
        start_date,
        end_date,
        status,
        location,
        cohort_number,
        metadata
      ) VALUES (
        v_course,
        'cohort',
        (v_course_config->>'display_name') || ' - ' || TO_CHAR(v_start_date, 'Month') || ' Cohort',
        'Intensive ' || (v_course_config->>'duration_weeks') || '-week masterclass with hands-on projects, expert mentorship, and industry-recognized certification.',
        v_start_date,
        v_end_date,
        'upcoming',
        'online',
        2,
        jsonb_build_object(
          'duration_weeks', (v_course_config->>'duration_weeks')::int,
          'session_day', CASE (v_course_config->>'day_of_week')::int
            WHEN 0 THEN 'Sunday'
            WHEN 1 THEN 'Monday'
            WHEN 2 THEN 'Tuesday'
            WHEN 3 THEN 'Wednesday'
            WHEN 4 THEN 'Thursday'
            WHEN 5 THEN 'Friday'
            WHEN 6 THEN 'Saturday'
          END,
          'session_time', v_course_config->>'session_time',
          'month_name', TO_CHAR(v_start_date, 'Month'),
          'cohort_suffix', ' Cohort'
        )
      );
      
      RAISE NOTICE 'Created Cohort 2 for % starting %', v_course, v_start_date;
    ELSE
      RAISE NOTICE 'Course % already has % cohorts, skipping', v_course, v_cohort_count;
    END IF;
  END LOOP;
END $$;