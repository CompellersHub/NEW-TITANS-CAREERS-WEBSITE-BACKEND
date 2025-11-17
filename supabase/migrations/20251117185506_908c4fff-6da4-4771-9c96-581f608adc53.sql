
-- Fix the 3-parameter generate_cohort_events function by adding search_path
CREATE OR REPLACE FUNCTION public.generate_cohort_events(
  p_course_slug text, 
  p_course_title text, 
  p_months_ahead integer DEFAULT 6
)
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
      title, description, course_slug, event_type, start_date, end_date, cohort_number, status
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
    
    v_start_date := v_start_date + INTERVAL '2 weeks';
    v_cohort_num := v_cohort_num + 1;
    
    INSERT INTO public.events (
      title, description, course_slug, event_type, start_date, end_date, cohort_number, status
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
$function$;
