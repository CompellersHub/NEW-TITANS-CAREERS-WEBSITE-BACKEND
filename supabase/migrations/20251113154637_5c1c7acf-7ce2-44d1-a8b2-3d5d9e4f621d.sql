-- Create or replace lead scoring function used by the frontend/components
CREATE OR REPLACE FUNCTION public.update_lead_score(
  p_email text,
  p_score_change integer,
  p_behavior text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Try to update existing row
  UPDATE public.lead_scores
  SET 
    total_score = COALESCE(total_score, 0) + COALESCE(p_score_change, 0),
    updated_at = now(),
    last_activity = now(),
    source = COALESCE(p_behavior, source)
  WHERE email = p_email;

  -- If no row was updated, insert a new one
  IF NOT FOUND THEN
    INSERT INTO public.lead_scores (email, total_score, source)
    VALUES (p_email, COALESCE(p_score_change, 0), p_behavior);
  END IF;

  -- Normalize status by thresholds
  UPDATE public.lead_scores
  SET status = CASE 
      WHEN total_score >= 100 THEN 'hot'
      WHEN total_score >= 50 THEN 'warm'
      ELSE 'cold'
    END
  WHERE email = p_email;
END;
$$;

-- Ensure roles can call the function from the client
GRANT EXECUTE ON FUNCTION public.update_lead_score(text, integer, text) TO anon, authenticated;

-- Touch key tables to ensure type generation includes them (no-op if already present)
COMMENT ON TABLE public.ai_advisor_conversations IS 'AI advisor conversations';
COMMENT ON TABLE public.ai_advisor_messages IS 'AI advisor messages';
COMMENT ON TABLE public.user_behaviors IS 'User behavior tracking events';
COMMENT ON TABLE public.lead_magnets IS 'Lead magnets catalog';
COMMENT ON TABLE public.lead_magnet_downloads IS 'Lead magnet downloads';
COMMENT ON TABLE public.exit_captures IS 'Exit intent captures';
COMMENT ON TABLE public.quiz_results IS 'Quiz/assessment results';
COMMENT ON TABLE public.referrals IS 'Referral records';