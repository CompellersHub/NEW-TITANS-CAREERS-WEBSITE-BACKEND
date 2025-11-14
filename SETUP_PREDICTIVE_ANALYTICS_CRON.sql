-- Setup automated predictive analytics generation
-- Run this SQL in your Supabase SQL editor via the insert tool

-- Enable required extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule predictions to run daily at 6 AM UTC
SELECT cron.schedule(
  'generate-predictions-daily',
  '0 6 * * *', -- Every day at 6 AM UTC
  $$
  SELECT
    net.http_post(
        url:='https://gfmhhnynyxvmekhvytgg.supabase.co/functions/v1/predict-alerts',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmbWhobnlueXh2bWVraHZ5dGdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5ODQwMzEsImV4cCI6MjA3ODU2MDAzMX0.tOf2Y2IwSuBoQ_XBIauovYM5KwbgRZ7fdecWKXvuAU4"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);

-- Alternative: Every 6 hours for more frequent predictions
-- Uncomment the block below and comment out the daily schedule above if you prefer more frequent updates

/*
SELECT cron.schedule(
  'generate-predictions-6h',
  '0 */6 * * *', -- Every 6 hours
  $$
  SELECT
    net.http_post(
        url:='https://gfmhhnynyxvmekhvytgg.supabase.co/functions/v1/predict-alerts',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmbWhobnlueXh2bWVraHZ5dGdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5ODQwMzEsImV4cCI6MjA3ODU2MDAzMX0.tOf2Y2IwSuBoQ_XBIauovYM5KwbgRZ7fdecWKXvuAU4"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);
*/

-- Alternative: Every 12 hours (6 AM and 6 PM)
-- Uncomment the block below and comment out the daily schedule above if you prefer twice-daily updates

/*
SELECT cron.schedule(
  'generate-predictions-12h',
  '0 6,18 * * *', -- Every day at 6 AM and 6 PM UTC
  $$
  SELECT
    net.http_post(
        url:='https://gfmhhnynyxvmekhvytgg.supabase.co/functions/v1/predict-alerts',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmbWhobnlueXh2bWVraHZ5dGdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5ODQwMzEsImV4cCI6MjA3ODU2MDAzMX0.tOf2Y2IwSuBoQ_XBIauovYM5KwbgRZ7fdecWKXvuAU4"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);
*/

-- View all scheduled prediction jobs
SELECT * FROM cron.job WHERE jobname LIKE '%prediction%';

-- Unschedule a job if needed (uncomment and run to remove)
-- SELECT cron.unschedule('generate-predictions-daily');
-- SELECT cron.unschedule('generate-predictions-6h');
-- SELECT cron.unschedule('generate-predictions-12h');

-- Check recent job runs
SELECT * FROM cron.job_run_details 
WHERE jobname LIKE '%prediction%'
ORDER BY start_time DESC 
LIMIT 10;