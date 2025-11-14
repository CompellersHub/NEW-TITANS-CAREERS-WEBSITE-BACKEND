-- Enable required extensions for cron and HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule the abandoned checkout processor to run every hour
-- This will automatically send reminder emails to customers who abandoned checkout
SELECT cron.schedule(
  'process-abandoned-checkouts',
  '0 * * * *', -- Every hour at minute 0 (adjust as needed)
  $$
  SELECT
    net.http_post(
        url:='https://gfmhhnynyxvmekhvytgg.supabase.co/functions/v1/process-abandoned-checkouts',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmbWhobnlueXh2bWVraHZ5dGdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5ODQwMzEsImV4cCI6MjA3ODU2MDAzMX0.tOf2Y2IwSuBoQ_XBIauovYM5KwbgRZ7fdecWKXvuAU4"}'::jsonb,
        body:=concat('{"triggered_at": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);

-- Verify the cron job was created successfully
SELECT * FROM cron.job WHERE jobname = 'process-abandoned-checkouts';

-- To view recent cron job executions:
-- SELECT * FROM cron.job_run_details 
-- WHERE jobname = 'process-abandoned-checkouts'
-- ORDER BY start_time DESC
-- LIMIT 10;

-- To unschedule the job (if needed):
-- SELECT cron.unschedule('process-abandoned-checkouts');

-- To change the schedule frequency (if needed):
-- SELECT cron.unschedule('process-abandoned-checkouts');
-- Then run the schedule command above with a different cron expression:
-- Examples:
-- '*/30 * * * *'  -- Every 30 minutes
-- '0 */2 * * *'   -- Every 2 hours
-- '0 9,17 * * *'  -- Twice daily at 9am and 5pm
