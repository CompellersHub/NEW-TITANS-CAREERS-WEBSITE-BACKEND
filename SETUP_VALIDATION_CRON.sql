-- Setup automated prediction validation
-- Run this SQL in your Supabase SQL editor via the insert tool

-- Enable required extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule prediction validation to run daily at 10 AM (after predictions run at 6 AM)
SELECT cron.schedule(
  'validate-predictions-daily',
  '0 10 * * *', -- Every day at 10 AM UTC (4 hours after predictions)
  $$
  SELECT
    net.http_post(
        url:='https://gfmhhnynyxvmekhvytgg.supabase.co/functions/v1/validate-predictions',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmbWhobnlueXh2bWVraHZ5dGdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5ODQwMzEsImV4cCI6MjA3ODU2MDAzMX0.tOf2Y2IwSuBoQ_XBIauovYM5KwbgRZ7fdecWKXvuAU4"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);

-- Alternative: Every 12 hours for more frequent validation
-- Uncomment the block below and comment out the daily schedule above if you prefer more frequent checks

/*
SELECT cron.schedule(
  'validate-predictions-12h',
  '0 */12 * * *', -- Every 12 hours
  $$
  SELECT
    net.http_post(
        url:='https://gfmhhnynyxvmekhvytgg.supabase.co/functions/v1/validate-predictions',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmbWhobnlueXh2bWVraHZ5dGdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5ODQwMzEsImV4cCI6MjA3ODU2MDAzMX0.tOf2Y2IwSuBoQ_XBIauovYM5KwbgRZ7fdecWKXvuAU4"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);
*/

-- View all scheduled validation jobs
SELECT * FROM cron.job WHERE jobname LIKE '%validation%';

-- Unschedule a job if needed (uncomment and run to remove)
-- SELECT cron.unschedule('validate-predictions-daily');
-- SELECT cron.unschedule('validate-predictions-12h');