-- Setup automated event lifecycle maintenance cron job
-- This runs daily at midnight to:
-- 1. Update event statuses (upcoming -> ongoing -> completed)
-- 2. Archive completed events 24 hours after end_date
-- 3. Maintain cohort pipeline (ensure 2 upcoming cohorts per course)

-- First, ensure pg_cron and pg_net extensions are enabled
-- (These are typically enabled by default in Supabase projects)

-- Schedule the event lifecycle maintenance function to run daily at midnight
SELECT cron.schedule(
  'maintain-event-lifecycle-daily',
  '0 0 * * *', -- Run at midnight every day (00:00)
  $$
  SELECT
    net.http_post(
      url:='https://gfmhhnynyxvmekhvytgg.supabase.co/functions/v1/maintain-event-lifecycle',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmbWhobnlueXh2bWVraHZ5dGdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5ODQwMzEsImV4cCI6MjA3ODU2MDAzMX0.tOf2Y2IwSuBoQ_XBIauovYM5KwbgRZ7fdecWKXvuAU4"}'::jsonb,
      body:=concat('{"triggered_at": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);

-- To check if the cron job is scheduled correctly:
-- SELECT * FROM cron.job WHERE jobname = 'maintain-event-lifecycle-daily';

-- To manually unschedule (if needed):
-- SELECT cron.unschedule('maintain-event-lifecycle-daily');

-- To manually trigger the function for testing:
-- SELECT net.http_post(
--   url:='https://gfmhhnynyxvmekhvytgg.supabase.co/functions/v1/maintain-event-lifecycle',
--   headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmbWhobnlueXh2bWVraHZ5dGdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5ODQwMzEsImV4cCI6MjA3ODU2MDAzMX0.tOf2Y2IwSuBoQ_XBIauovYM5KwbgRZ7fdecWKXvuAU4"}'::jsonb,
--   body:='{"manual_trigger": true}'::jsonb
-- );
