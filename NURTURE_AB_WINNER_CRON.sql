-- Setup cron job to automatically select nurture A/B test winners
-- This should be run manually in the Lovable Cloud SQL editor
-- Schedule: Daily at 2 AM UTC to evaluate A/B test performance

-- Enable required extensions (if not already enabled)
-- These are typically already enabled in Lovable Cloud

-- Schedule the winner selection function to run daily
SELECT cron.schedule(
  'select-nurture-ab-winner-daily',
  '0 2 * * *', -- Daily at 2 AM UTC
  $$
  SELECT
    net.http_post(
        url:='https://gfmhhnynyxvmekhvytgg.supabase.co/functions/v1/select-nurture-ab-winner',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmbWhobnlueXh2bWVraHZ5dGdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5ODQwMzEsImV4cCI6MjA3ODU2MDAzMX0.tOf2Y2IwSuBoQ_XBIauovYM5KwbgRZ7fdecWKXvuAU4"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);

-- To check if the cron job is scheduled:
-- SELECT * FROM cron.job WHERE jobname = 'select-nurture-ab-winner-daily';

-- To manually trigger the function for testing:
-- SELECT
--   net.http_post(
--       url:='https://gfmhhnynyxvmekhvytgg.supabase.co/functions/v1/select-nurture-ab-winner',
--       headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmbWhobnlueXh2bWVraHZ5dGdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5ODQwMzEsImV4cCI6MjA3ODU2MDAzMX0.tOf2Y2IwSuBoQ_XBIauovYM5KwbgRZ7fdecWKXvuAU4"}'::jsonb,
--       body:='{}'::jsonb
--   ) as request_id;

-- To unschedule the cron job:
-- SELECT cron.unschedule('select-nurture-ab-winner-daily');
