-- Setup automated recovery alerts checking
-- Run this SQL in your Supabase SQL editor or via the insert tool

-- Enable required extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule the recovery alerts check to run daily at 9 AM
SELECT cron.schedule(
  'check-recovery-alerts-daily',
  '0 9 * * *', -- Every day at 9 AM UTC
  $$
  SELECT
    net.http_post(
        url:='https://gfmhhnynyxvmekhvytgg.supabase.co/functions/v1/check-recovery-alerts',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmbWhobnlueXh2bWVraHZ5dGdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5ODQwMzEsImV4cCI6MjA3ODU2MDAzMX0.tOf2Y2IwSuBoQ_XBIauovYM5KwbgRZ7fdecWKXvuAU4"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);

-- Alternative: Every 6 hours for more frequent monitoring
-- Uncomment the block below and comment out the daily schedule above if you prefer more frequent checks

/*
SELECT cron.schedule(
  'check-recovery-alerts-6h',
  '0 */6 * * *', -- Every 6 hours
  $$
  SELECT
    net.http_post(
        url:='https://gfmhhnynyxvmekhvytgg.supabase.co/functions/v1/check-recovery-alerts',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmbWhobnlueXh2bWVraHZ5dGdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5ODQwMzEsImV4cCI6MjA3ODU2MDAzMX0.tOf2Y2IwSuBoQ_XBIauovYM5KwbgRZ7fdecWKXvuAU4"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);
*/

-- View all scheduled cron jobs
SELECT * FROM cron.job WHERE jobname LIKE '%recovery%';

-- Unschedule a job if needed (uncomment and run to remove)
-- SELECT cron.unschedule('check-recovery-alerts-daily');
