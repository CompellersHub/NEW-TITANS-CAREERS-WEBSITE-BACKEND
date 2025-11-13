-- ============================================
-- AUTOMATED EMAIL CAMPAIGN CRON SETUP
-- ============================================
-- Run this SQL in Lovable Cloud → Database → SQL Editor
-- This sets up a weekly cron job to send automated campaigns

-- Step 1: Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Step 2: Schedule weekly campaign (Every Monday at 9 AM UTC)
SELECT cron.schedule(
  'send-weekly-newsletter',
  '0 9 * * 1', -- Cron expression: Every Monday at 9 AM
  $$
  SELECT net.http_post(
    url:='https://gfmhhnynyxvmekhvytgg.supabase.co/functions/v1/send-weekly-campaign',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmbWhobnlueXh2bWVraHZ5dGdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5ODQwMzEsImV4cCI6MjA3ODU2MDAzMX0.tOf2Y2IwSuBoQ_XBIauovYM5KwbgRZ7fdecWKXvuAU4"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);

-- ============================================
-- VERIFICATION QUERIES (Optional)
-- ============================================

-- Check if cron job was created successfully
SELECT * FROM cron.job WHERE jobname = 'send-weekly-newsletter';

-- View cron job run history (after first run)
-- SELECT * FROM cron.job_run_details 
-- ORDER BY start_time DESC 
-- LIMIT 10;

-- ============================================
-- CRON SCHEDULE OPTIONS (Choose One)
-- ============================================
-- Uncomment and modify the schedule above to change timing:

-- Every Monday at 9 AM UTC
-- '0 9 * * 1'

-- Every Wednesday at 10 AM UTC
-- '0 10 * * 3'

-- Every Friday at 8 AM UTC
-- '0 8 * * 5'

-- Daily at 9 AM (for testing)
-- '0 9 * * *'

-- ============================================
-- MANAGEMENT QUERIES (Use as needed)
-- ============================================

-- Unschedule/Delete the cron job
-- SELECT cron.unschedule('send-weekly-newsletter');

-- Update cron schedule (first unschedule, then reschedule with new time)
-- SELECT cron.unschedule('send-weekly-newsletter');
-- Then run the SELECT cron.schedule() command above with new timing

-- ============================================
-- NOTES
-- ============================================
-- 1. The cron job runs in UTC time zone
-- 2. Convert your local time to UTC when setting schedule
-- 3. Monitor first few runs to ensure successful delivery
-- 4. Check edge function logs if campaigns don't send
-- 5. Verify BREVO_API_KEY secret is configured
-- 6. Ensure sender email is verified in Brevo

-- ============================================
-- NEXT STEPS
-- ============================================
-- 1. Populate initial campaign content:
--    Visit: https://gfmhhnynyxvmekhvytgg.supabase.co/functions/v1/populate-campaign-content
--
-- 2. Update sender email in edge functions:
--    - supabase/functions/send-weekly-campaign/index.ts (line 91)
--    - supabase/functions/newsletter-signup/index.ts (line 85)
--
-- 3. Test manually before first scheduled run:
--    Visit: https://gfmhhnynyxvmekhvytgg.supabase.co/functions/v1/send-weekly-campaign
--
-- 4. Monitor results:
--    SELECT * FROM email_campaigns ORDER BY sent_at DESC LIMIT 5;
