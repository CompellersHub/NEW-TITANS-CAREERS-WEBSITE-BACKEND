-- Fix Function Search Path Mutable warnings
-- Add SET search_path = public to all functions missing it

-- Update handle_updated_at function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- Update generate_certificate_number function
CREATE OR REPLACE FUNCTION public.generate_certificate_number()
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $function$
DECLARE
  cert_number TEXT;
BEGIN
  cert_number := 'TC-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(FLOOR(RANDOM() * 999999)::TEXT, 6, '0');
  RETURN cert_number;
END;
$function$;

-- Update generate_cohort_events function
CREATE OR REPLACE FUNCTION public.generate_cohort_events(p_course_slug text, p_months_ahead integer DEFAULT 6)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_start_date DATE;
  v_cohort_num INTEGER;
  v_month_offset INTEGER;
BEGIN
  SELECT COALESCE(MAX(cohort_number), 0) INTO v_cohort_num
  FROM public.events
  WHERE course_slug = p_course_slug;
  
  FOR v_month_offset IN 0..p_months_ahead LOOP
    v_start_date := date_trunc('month', CURRENT_DATE + (v_month_offset || ' months')::INTERVAL)::DATE;
    v_start_date := v_start_date + ((7 - EXTRACT(DOW FROM v_start_date)::INTEGER + 1) % 7);
    v_cohort_num := v_cohort_num + 1;
    
    INSERT INTO public.events (
      title, description, course_slug, event_type, start_date, end_date,
      cohort_number, status
    )
    VALUES (
      'Cohort ' || v_cohort_num,
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
    
    v_start_date := v_start_date + INTERVAL '2 weeks';
    v_cohort_num := v_cohort_num + 1;
    
    INSERT INTO public.events (
      title, description, course_slug, event_type, start_date, end_date,
      cohort_number, status
    )
    VALUES (
      'Cohort ' || v_cohort_num,
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
$function$;

-- Update update_event_status function
CREATE OR REPLACE FUNCTION public.update_event_status()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;

-- Update archive_expired_events function
CREATE OR REPLACE FUNCTION public.archive_expired_events()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;

-- Update maintain_cohort_pipeline function
CREATE OR REPLACE FUNCTION public.maintain_cohort_pipeline()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  course_record RECORD;
  upcoming_count INTEGER;
  last_cohort_number INTEGER;
  last_end_date TIMESTAMP WITH TIME ZONE;
  new_start_date TIMESTAMP WITH TIME ZONE;
  new_end_date TIMESTAMP WITH TIME ZONE;
  i INTEGER;
BEGIN
  FOR course_record IN 
    SELECT DISTINCT course_slug FROM events WHERE event_type = 'cohort'
  LOOP
    SELECT COUNT(*) INTO upcoming_count
    FROM events
    WHERE course_slug = course_record.course_slug
      AND event_type = 'cohort'
      AND status IN ('upcoming', 'ongoing')
      AND start_date >= now();
    
    IF upcoming_count < 2 THEN
      SELECT COALESCE(MAX(cohort_number), 0), MAX(end_date)
      INTO last_cohort_number, last_end_date
      FROM events
      WHERE course_slug = course_record.course_slug
        AND event_type = 'cohort';
      
      FOR i IN 1..(2 - upcoming_count) LOOP
        last_cohort_number := last_cohort_number + 1;
        
        IF last_end_date IS NULL THEN
          new_start_date := now() + interval '2 weeks';
        ELSE
          new_start_date := last_end_date + interval '2 weeks';
        END IF;
        
        new_end_date := new_start_date + interval '8 weeks';
        
        INSERT INTO events (
          title, course_slug, event_type, start_date, end_date, status,
          cohort_number, description, location, max_participants, current_participants
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
$function$;

-- Update refresh_course_cohorts function  
CREATE OR REPLACE FUNCTION public.refresh_course_cohorts(p_course_slug text, p_months_ahead integer DEFAULT 6)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  last_cohort_number INTEGER;
  new_start_date TIMESTAMP WITH TIME ZONE;
  new_end_date TIMESTAMP WITH TIME ZONE;
  cohorts_to_generate INTEGER;
  i INTEGER;
BEGIN
  SELECT COALESCE(MAX(cohort_number), 0)
  INTO last_cohort_number
  FROM events
  WHERE course_slug = p_course_slug
    AND event_type = 'cohort';
  
  cohorts_to_generate := CEIL(p_months_ahead / 2.5);
  new_start_date := now() + interval '2 weeks';
  
  FOR i IN 1..cohorts_to_generate LOOP
    last_cohort_number := last_cohort_number + 1;
    new_end_date := new_start_date + interval '8 weeks';
    
    INSERT INTO events (
      title, course_slug, event_type, start_date, end_date, status,
      cohort_number, description, location, max_participants, current_participants
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
    
    new_start_date := new_end_date + interval '2 weeks';
  END LOOP;
END;
$function$;

-- Update remaining functions
CREATE OR REPLACE FUNCTION public.update_payment_intents_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_bank_orders_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_user_preferences_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.log_user_activity(p_user_id uuid, p_email text, p_activity_type text, p_description text DEFAULT NULL::text, p_metadata jsonb DEFAULT '{}'::jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  activity_id UUID;
BEGIN
  INSERT INTO public.user_activity_log (
    user_id, email, activity_type, description, metadata
  ) VALUES (
    p_user_id, p_email, p_activity_type, p_description, p_metadata
  )
  RETURNING id INTO activity_id;
  
  RETURN activity_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_lead_scores_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_form_submission_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.last_updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.calculate_sla_deadline(priority_level text, created_at timestamp with time zone)
RETURNS timestamp with time zone
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $function$
BEGIN
  CASE priority_level
    WHEN 'high' THEN RETURN created_at + INTERVAL '1 hour';
    WHEN 'medium' THEN RETURN created_at + INTERVAL '24 hours';
    WHEN 'low' THEN RETURN created_at + INTERVAL '48 hours';
    ELSE RETURN created_at + INTERVAL '24 hours';
  END CASE;
END;
$function$;

CREATE OR REPLACE FUNCTION public.calculate_sla_status(deadline timestamp with time zone, current_status text)
RETURNS text
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $function$
DECLARE
  time_remaining interval;
  total_time interval;
BEGIN
  IF current_status IN ('resolved', 'archived') THEN
    RETURN 'met';
  END IF;
  
  time_remaining := deadline - now();
  
  IF time_remaining < INTERVAL '0' THEN
    RETURN 'overdue';
  END IF;
  
  total_time := deadline - (deadline - time_remaining);
  
  IF time_remaining < (total_time * 0.25) THEN
    RETURN 'approaching';
  END IF;
  
  RETURN 'on_track';
END;
$function$;

CREATE OR REPLACE FUNCTION public.set_sla_deadline()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.sla_deadline := calculate_sla_deadline(NEW.priority, NEW.created_at);
  NEW.sla_status := calculate_sla_status(NEW.sla_deadline, NEW.status);
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_sla_on_priority_change()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  IF OLD.priority IS DISTINCT FROM NEW.priority AND NEW.status NOT IN ('resolved', 'archived') THEN
    NEW.sla_deadline := calculate_sla_deadline(NEW.priority, NEW.created_at);
    NEW.sla_status := calculate_sla_status(NEW.sla_deadline, NEW.status);
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_sla_on_status_change()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    NEW.sla_status := calculate_sla_status(NEW.sla_deadline, NEW.status);
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.calculate_next_send_time()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  IF NEW.recurrence_type = 'none' THEN
    NEW.next_send_at := NEW.scheduled_time;
  ELSE
    IF NEW.last_sent_at IS NOT NULL THEN
      IF NEW.recurrence_type = 'daily' THEN
        NEW.next_send_at := NEW.last_sent_at + INTERVAL '1 day';
      ELSIF NEW.recurrence_type = 'weekly' THEN
        NEW.next_send_at := NEW.last_sent_at + INTERVAL '1 week';
      ELSIF NEW.recurrence_type = 'monthly' THEN
        NEW.next_send_at := NEW.last_sent_at + INTERVAL '1 month';
      END IF;
    ELSE
      NEW.next_send_at := NEW.scheduled_time;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;