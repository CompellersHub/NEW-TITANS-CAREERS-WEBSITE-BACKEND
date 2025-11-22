-- ============================================
-- FULL EVENT AUTOMATION SYSTEM
-- ============================================

-- 1. Create automation_config table for admin controls
CREATE TABLE IF NOT EXISTS public.automation_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key TEXT UNIQUE NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_run_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create event_templates table for weekly recurring events
CREATE TABLE IF NOT EXISTS public.event_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('q&a', 'workshop', 'webinar', 'cohort')),
  course_slug TEXT NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  time TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 90,
  description TEXT,
  speaker_name TEXT,
  speaker_role TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  recurrence_pattern TEXT NOT NULL DEFAULT 'weekly' CHECK (recurrence_pattern IN ('weekly', 'biweekly', 'monthly')),
  generate_weeks_ahead INTEGER NOT NULL DEFAULT 8,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Enable RLS
ALTER TABLE public.automation_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_templates ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for automation_config
CREATE POLICY "Admins can view automation config"
  ON public.automation_config FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update automation config"
  ON public.automation_config FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert automation config"
  ON public.automation_config FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 5. RLS Policies for event_templates
CREATE POLICY "Admins can manage event templates"
  ON public.event_templates FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view active templates"
  ON public.event_templates FOR SELECT
  TO public
  USING (is_active = true);

-- 6. Seed automation config
INSERT INTO public.automation_config (config_key, is_enabled, settings)
VALUES 
  ('cohort_automation', true, '{
    "cohorts_to_maintain": 2,
    "gap_weeks_between_cohorts": 6,
    "archive_after_hours": 24,
    "excluded_date_ranges": [
      {"start": "2025-12-24", "end": "2026-01-07", "reason": "Christmas/New Year"},
      {"start": "2026-12-24", "end": "2027-01-07", "reason": "Christmas/New Year"},
      {"start": "2025-04-18", "end": "2025-04-21", "reason": "Easter 2025"},
      {"start": "2026-04-03", "end": "2026-04-06", "reason": "Easter 2026"}
    ],
    "notification_emails": []
  }'::jsonb),
  ('weekly_events_automation', true, '{
    "generate_weeks_ahead": 8,
    "cleanup_weeks_past": 4,
    "notification_emails": []
  }'::jsonb)
ON CONFLICT (config_key) DO NOTHING;

-- 7. Seed event templates
INSERT INTO public.event_templates (template_name, event_type, course_slug, day_of_week, time, duration_minutes, description, speaker_name, speaker_role, metadata, recurrence_pattern, generate_weeks_ahead)
VALUES
  ('Data Analysis Q&A Session', 'q&a', 'data-analysis', 3, '19:00', 90, 
   'Join our expert instructors for an interactive Q&A session.',
   'Dr. Sarah Chen', 'Senior Data Scientist',
   '{"learning_objectives": ["Excel advanced functions", "SQL query optimization"], "tools": ["Excel", "SQL", "Python"]}'::jsonb,
   'weekly', 8),
  
  ('Data Analysis Workshop', 'workshop', 'data-analysis', 6, '14:00', 120,
   'Hands-on workshop covering real-world data analysis scenarios.',
   'Prof. Michael Torres', 'Data Analytics Director',
   '{"learning_objectives": ["Practical data cleaning", "Statistical analysis"], "tools": ["Excel", "SQL", "Python"]}'::jsonb,
   'weekly', 8),

  ('AML/KYC Q&A Session', 'q&a', 'aml-kyc', 5, '18:30', 90,
   'Expert-led Q&A on AML regulations and compliance.',
   'James Wilson', 'Compliance Expert',
   '{"learning_objectives": ["AML regulations", "KYC procedures"], "tools": ["Compliance software"]}'::jsonb,
   'weekly', 8),

  ('AML/KYC Workshop', 'workshop', 'aml-kyc', 0, '15:00', 120,
   'Practical workshop on transaction monitoring.',
   'Emma Davies', 'Financial Crime Prevention Lead',
   '{"learning_objectives": ["Transaction monitoring", "Risk assessment"], "tools": ["AML software"]}'::jsonb,
   'weekly', 8),

  ('Cybersecurity Q&A Session', 'q&a', 'cybersecurity', 0, '19:00', 90,
   'Get answers about network security and ethical hacking.',
   'Alex Kumar', 'Security Architect',
   '{"learning_objectives": ["Network security", "Ethical hacking"], "tools": ["Kali Linux", "Wireshark"]}'::jsonb,
   'weekly', 8),

  ('Cybersecurity Workshop', 'workshop', 'cybersecurity', 6, '16:00', 120,
   'Hands-on security workshop covering penetration testing.',
   'Rachel Adams', 'Ethical Hacker',
   '{"learning_objectives": ["Penetration testing", "Vulnerability assessment"], "tools": ["Kali Linux", "Nmap"]}'::jsonb,
   'weekly', 8),

  ('Business Analysis Q&A Session', 'q&a', 'business-analysis', 0, '18:00', 90,
   'Expert guidance on requirements gathering.',
   'David Morrison', 'Senior Business Analyst',
   '{"learning_objectives": ["Requirements gathering", "Stakeholder management"], "tools": ["JIRA", "Confluence"]}'::jsonb,
   'weekly', 8),

  ('Business Analysis Workshop', 'workshop', 'business-analysis', 6, '13:00', 120,
   'Practical workshop on creating user stories.',
   'Lisa Thompson', 'BA Practice Lead',
   '{"learning_objectives": ["User stories", "Process diagrams"], "tools": ["JIRA", "Miro"]}'::jsonb,
   'weekly', 8)
ON CONFLICT DO NOTHING;

-- 8. Function to check excluded dates
CREATE OR REPLACE FUNCTION public.is_date_excluded(check_date DATE)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  config_record automation_config%ROWTYPE;
  exclusion JSONB;
BEGIN
  SELECT * INTO config_record
  FROM automation_config
  WHERE config_key = 'cohort_automation' AND is_enabled = true;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  FOR exclusion IN SELECT * FROM jsonb_array_elements(config_record.settings->'excluded_date_ranges')
  LOOP
    IF check_date BETWEEN (exclusion->>'start')::DATE AND (exclusion->>'end')::DATE THEN
      RETURN true;
    END IF;
  END LOOP;
  
  RETURN false;
END;
$$;

-- 9. Function to generate weekly events
CREATE OR REPLACE FUNCTION public.generate_weekly_events()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  template_record event_templates%ROWTYPE;
  config_record automation_config%ROWTYPE;
  loop_date DATE;
  event_date DATE;
  weeks_ahead INTEGER;
  events_created INTEGER := 0;
  next_week_monday DATE;
BEGIN
  SELECT * INTO config_record
  FROM automation_config
  WHERE config_key = 'weekly_events_automation';
  
  IF NOT FOUND OR config_record.is_enabled = false THEN
    RETURN jsonb_build_object('success', false, 'message', 'Weekly events automation is disabled');
  END IF;
  
  weeks_ahead := COALESCE((config_record.settings->>'generate_weeks_ahead')::INTEGER, 8);
  next_week_monday := date_trunc('week', CURRENT_DATE + INTERVAL '1 week')::DATE;
  
  FOR template_record IN 
    SELECT * FROM event_templates WHERE is_active = true AND event_type IN ('q&a', 'workshop', 'webinar')
  LOOP
    loop_date := next_week_monday;
    
    WHILE loop_date <= next_week_monday + (weeks_ahead || ' weeks')::INTERVAL LOOP
      event_date := loop_date + (template_record.day_of_week || ' days')::INTERVAL;
      
      IF NOT is_date_excluded(event_date) THEN
        IF NOT EXISTS (
          SELECT 1 FROM events 
          WHERE course_slug = template_record.course_slug 
            AND event_type = template_record.event_type
            AND start_date::DATE = event_date
        ) THEN
          INSERT INTO events (
            title, description, course_slug, event_type, start_date, end_date,
            location, instructor_name, metadata, status
          ) VALUES (
            template_record.template_name,
            template_record.description,
            template_record.course_slug,
            template_record.event_type,
            event_date + template_record.time::TIME,
            event_date + template_record.time::TIME + (template_record.duration_minutes || ' minutes')::INTERVAL,
            'online',
            template_record.speaker_name,
            jsonb_build_object(
              'speaker_role', template_record.speaker_role,
              'learning_objectives', template_record.metadata->'learning_objectives',
              'tools', template_record.metadata->'tools',
              'generated_from_template', template_record.id
            ),
            CASE 
              WHEN event_date > CURRENT_DATE THEN 'upcoming'
              WHEN event_date = CURRENT_DATE THEN 'ongoing'
              ELSE 'completed'
            END
          );
          
          events_created := events_created + 1;
        END IF;
      END IF;
      
      IF template_record.recurrence_pattern = 'weekly' THEN
        loop_date := loop_date + INTERVAL '1 week';
      ELSIF template_record.recurrence_pattern = 'biweekly' THEN
        loop_date := loop_date + INTERVAL '2 weeks';
      ELSIF template_record.recurrence_pattern = 'monthly' THEN
        loop_date := loop_date + INTERVAL '1 month';
      END IF;
    END LOOP;
  END LOOP;
  
  RETURN jsonb_build_object(
    'success', true,
    'events_created', events_created,
    'timestamp', now()
  );
END;
$$;

-- 10. Cleanup function
CREATE OR REPLACE FUNCTION public.cleanup_old_events()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  config_record automation_config%ROWTYPE;
  cleanup_weeks INTEGER;
  archived_count INTEGER;
BEGIN
  SELECT * INTO config_record
  FROM automation_config
  WHERE config_key = 'weekly_events_automation';
  
  IF NOT FOUND THEN
    cleanup_weeks := 4;
  ELSE
    cleanup_weeks := COALESCE((config_record.settings->>'cleanup_weeks_past')::INTEGER, 4);
  END IF;
  
  UPDATE events
  SET status = 'archived', archived_at = NOW()
  WHERE status = 'completed'
    AND end_date < (NOW() - (cleanup_weeks || ' weeks')::INTERVAL)
    AND archived_at IS NULL
    AND event_type IN ('q&a', 'workshop', 'webinar');
  
  GET DIAGNOSTICS archived_count = ROW_COUNT;
  
  RETURN jsonb_build_object(
    'success', true,
    'archived_count', archived_count,
    'timestamp', now()
  );
END;
$$;

-- 11. Update maintain_cohort_pipeline
CREATE OR REPLACE FUNCTION public.maintain_cohort_pipeline()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
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
  config_record automation_config%ROWTYPE;
  cohorts_to_maintain INTEGER;
  gap_weeks INTEGER;
  attempts INTEGER;
BEGIN
  SELECT * INTO config_record
  FROM automation_config
  WHERE config_key = 'cohort_automation';
  
  IF NOT FOUND OR config_record.is_enabled = false THEN
    RETURN jsonb_build_object('success', false, 'message', 'Cohort automation is disabled');
  END IF;
  
  cohorts_to_maintain := COALESCE((config_record.settings->>'cohorts_to_maintain')::INTEGER, 2);
  gap_weeks := COALESCE((config_record.settings->>'gap_weeks_between_cohorts')::INTEGER, 6);

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
      
      WHILE upcoming_count < cohorts_to_maintain LOOP
        SELECT * INTO last_cohort_record
        FROM events
        WHERE course_slug = course_record.course_slug
          AND event_type = 'cohort'
        ORDER BY cohort_number DESC, start_date DESC
        LIMIT 1;
        
        duration_weeks := (course_config->course_record.course_slug->>'duration')::INTEGER;
        day_of_week := course_config->course_record.course_slug->>'day';
        session_time := course_config->course_record.course_slug->>'time';
        
        new_start_date := last_cohort_record.start_date + (gap_weeks || ' weeks')::INTERVAL;
        
        attempts := 0;
        WHILE is_date_excluded(new_start_date::DATE) AND attempts < 52 LOOP
          new_start_date := new_start_date + INTERVAL '1 week';
          attempts := attempts + 1;
        END LOOP;
        
        new_end_date := new_start_date + (duration_weeks || ' weeks')::INTERVAL;
        next_cohort_number := COALESCE(last_cohort_record.cohort_number, 0) + 1;
        
        month_name := TRIM(TO_CHAR(new_start_date, 'Month'));
        
        SELECT COUNT(*) INTO existing_in_month
        FROM events
        WHERE course_slug = course_record.course_slug
          AND event_type = 'cohort'
          AND EXTRACT(MONTH FROM start_date) = EXTRACT(MONTH FROM new_start_date)
          AND EXTRACT(YEAR FROM start_date) = EXTRACT(YEAR FROM new_start_date);
        
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

  UPDATE automation_config
  SET last_run_at = NOW()
  WHERE config_key = 'cohort_automation';

  result := jsonb_build_object(
    'success', true, 'courses_processed', courses_processed,
    'cohorts_created', cohorts_created, 'timestamp', NOW()
  );

  RETURN result;
END;
$$;

-- 12. Triggers
CREATE TRIGGER update_automation_config_updated_at
  BEFORE UPDATE ON public.automation_config
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_event_templates_updated_at
  BEFORE UPDATE ON public.event_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();