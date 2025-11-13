# Automated Email Campaign Setup Guide

This guide explains how to set up and manage automated weekly email campaigns that send career tips, job alerts, and course updates to your newsletter subscribers.

## 🎯 Overview

The automated campaign system:
- **Sends weekly emails** to all active subscribers
- **Rotates content types**: Career Tips → Job Alerts → Course Updates (repeats)
- **Tracks sent campaigns** to avoid duplicate content
- **Uses Brevo API** for email delivery
- **Runs on schedule** via Supabase cron jobs

## 📋 Quick Setup (3 Steps)

### Step 1: Populate Starter Content

First, run the populate function to add starter campaign templates:

```bash
# Call this edge function once to populate initial content
curl -X POST https://gfmhhnynyxvmekhvytgg.supabase.co/functions/v1/populate-campaign-content \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

Or visit: `https://gfmhhnynyxvmekhvytgg.supabase.co/functions/v1/populate-campaign-content`

This adds 4 starter email templates (2 career tips, 1 job alert, 1 course update).

### Step 2: Update Sender Email

Edit the sender email in **both** edge functions:
- `supabase/functions/send-weekly-campaign/index.ts` (line 91)
- `supabase/functions/newsletter-signup/index.ts` (line 85)

Change from:
```typescript
email: "noreply@titanscareer.com"
```

To your verified Brevo sender email:
```typescript
email: "noreply@yourdomain.com"
```

### Step 3: Set Up Cron Job

Enable the `pg_cron` and `pg_net` extensions, then create the cron schedule.

**Run this SQL in Lovable Cloud → Database → SQL Editor:**

```sql
-- Enable extensions (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create weekly cron job (runs every Monday at 9 AM UTC)
SELECT cron.schedule(
  'send-weekly-newsletter',
  '0 9 * * 1', -- Every Monday at 9 AM UTC
  $$
  SELECT net.http_post(
    url:='https://gfmhhnynyxvmekhvytgg.supabase.co/functions/v1/send-weekly-campaign',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmbWhobnlueXh2bWVraHZ5dGdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5ODQwMzEsImV4cCI6MjA3ODU2MDAzMX0.tOf2Y2IwSuBoQ_XBIauovYM5KwbgRZ7fdecWKXvuAU4"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);
```

**Cron Schedule Options:**
```sql
-- Every Monday at 9 AM
'0 9 * * 1'

-- Every Wednesday at 10 AM
'0 10 * * 3'

-- Every Friday at 8 AM
'0 8 * * 5'

-- Daily at 9 AM (for testing)
'0 9 * * *'
```

## ✅ Testing the System

### Manual Test Campaign
Test the campaign manually before scheduling:

```bash
curl -X POST https://gfmhhnynyxvmekhvytgg.supabase.co/functions/v1/send-weekly-campaign \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

Or visit the URL directly in your browser (for public edge functions).

### Check Cron Job Status
```sql
-- View all cron jobs
SELECT * FROM cron.job;

-- View cron job run history
SELECT * FROM cron.job_run_details 
ORDER BY start_time DESC 
LIMIT 10;

-- Delete a cron job (if needed)
SELECT cron.unschedule('send-weekly-newsletter');
```

## 📧 How It Works

### Content Rotation System

The system automatically cycles through campaign types:
- **Week 1**: Career Tips
- **Week 2**: Job Alerts
- **Week 3**: Course Updates
- **Week 4**: Career Tips (cycle repeats)

Within each type, it sends the highest priority unsent content.

### Campaign Flow

1. **Cron triggers** the edge function weekly
2. **Determines campaign type** based on week number
3. **Fetches next unsent content** from `campaign_content` table
4. **Gets active subscribers** from `newsletter_subscribers`
5. **Sends via Brevo API** to all active subscribers
6. **Records campaign** in `email_campaigns` table
7. **Logs results** for tracking

### Database Tables

**`campaign_content`** - Email templates library
- `content_key`: Unique identifier (e.g., "career_tip_1")
- `campaign_type`: Type of campaign
- `subject`: Email subject line
- `html_content`: Email HTML body
- `priority`: Higher priority sent first (default: 0)
- `is_active`: Can be deactivated without deleting

**`email_campaigns`** - Sent campaign tracking
- `campaign_type`: What type was sent
- `subject`: Email subject
- `content_key`: Which content was used
- `sent_at`: When it was sent
- `recipient_count`: How many received it
- `success_count`: Successful deliveries
- `failure_count`: Failed deliveries

## 🎨 Creating New Campaign Content

### Add New Email via Admin Dashboard (Coming Soon)
Or add directly via SQL:

```sql
INSERT INTO campaign_content (
  content_key,
  campaign_type,
  subject,
  preview_text,
  html_content,
  priority
) VALUES (
  'career_tip_3',
  'career_tips',
  'Interview Red Flags: 7 Signs to Walk Away',
  'Don\'t waste time on bad employers - spot these early',
  '<html>... your email HTML ...</html>',
  8
);
```

### Campaign Types
- `career_tips`: Job search advice, LinkedIn tips, interview prep
- `job_alerts`: Current openings, hiring trends, application tips
- `course_updates`: New cohorts, success stories, course features

### Email HTML Template Structure
```html
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <!-- Header with gradient -->
  <div style="background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%); padding: 30px; text-align: center;">
    <h1 style="color: #fbbf24; margin: 0;">Your Subject Here</h1>
  </div>
  
  <!-- Main Content -->
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb;">
    <p>Your content...</p>
    
    <!-- CTA Button -->
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://titanscareer.com/courses" 
         style="display: inline-block; background: #fbbf24; color: #1e3a5f; 
                padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
        Your CTA Text
      </a>
    </div>
    
    <p>To your success,<br><strong>The Titans Careers Team</strong></p>
  </div>
  
  <!-- Footer -->
  <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
    <p>Titans Careers | Building Real Careers</p>
  </div>
</body>
</html>
```

## 📊 Monitoring Campaigns

### View Sent Campaigns
```sql
-- Recent campaigns
SELECT 
  campaign_type,
  subject,
  recipient_count,
  success_count,
  sent_at
FROM email_campaigns
ORDER BY sent_at DESC
LIMIT 10;

-- Campaigns by type
SELECT 
  campaign_type,
  COUNT(*) as total_sent,
  SUM(recipient_count) as total_recipients,
  AVG(recipient_count) as avg_recipients
FROM email_campaigns
GROUP BY campaign_type;
```

### Check Remaining Content
```sql
-- Unsent content by type
SELECT 
  campaign_type,
  COUNT(*) as unsent_count
FROM campaign_content
WHERE is_active = true
  AND content_key NOT IN (
    SELECT DISTINCT content_key FROM email_campaigns
  )
GROUP BY campaign_type;
```

## 🔧 Troubleshooting

### Campaigns Not Sending

**Check Cron Job Status:**
```sql
SELECT * FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'send-weekly-newsletter')
ORDER BY start_time DESC 
LIMIT 5;
```

**Check Edge Function Logs:**
- Go to Lovable Cloud → Functions → send-weekly-campaign
- View logs for errors

**Common Issues:**
- ❌ BREVO_API_KEY not set → Add secret in Lovable Cloud
- ❌ No active subscribers → Check newsletter_subscribers table
- ❌ No unsent content → Add more campaign_content
- ❌ Sender email not verified → Verify in Brevo dashboard

### Test Individual Components

**Test Brevo Connection:**
```bash
curl -X POST https://api.brevo.com/v3/smtp/email \
  -H "api-key: YOUR_BREVO_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"sender":{"email":"your@email.com"},"to":[{"email":"test@test.com"}],"subject":"Test","htmlContent":"<p>Test</p>"}'
```

**Test Subscriber Fetch:**
```sql
SELECT COUNT(*) FROM newsletter_subscribers WHERE active = true;
```

## 📈 Best Practices

### Content Strategy
1. **Maintain 3:1 ratio**: 3 value emails for every 1 promotional email
2. **Keep it focused**: One main topic per email
3. **Strong CTAs**: Clear next action for readers
4. **Mobile-friendly**: Test on mobile devices
5. **Track performance**: Monitor open rates in Brevo

### Email Timing
- **Best days**: Tuesday, Wednesday, Thursday
- **Best times**: 9-11 AM or 1-3 PM (UK time)
- **Avoid**: Monday mornings, Friday afternoons, weekends

### Content Calendar Example
```
Week 1 (Mon): Career Tip - LinkedIn optimization
Week 2 (Mon): Job Alert - Current openings
Week 3 (Mon): Course Update - New cohort announcement
Week 4 (Mon): Career Tip - Salary negotiation
Week 5 (Mon): Job Alert - Industry trends
Week 6 (Mon): Course Update - Student success stories
```

### Growing Your Library
Aim for:
- 10-15 career tip emails
- 8-10 job alert emails
- 6-8 course update emails
- Rotate seasonally (update job alerts monthly)

## 🚀 Advanced Features (Future)

### A/B Testing
Test different subject lines by creating variants:
```sql
INSERT INTO campaign_content (content_key, subject, ...) VALUES
('career_tip_4_v1', 'Subject Line A', ...),
('career_tip_4_v2', 'Subject Line B', ...);
```

### Segmentation
Target specific subscriber segments:
- By source (blog readers vs resource downloaders)
- By engagement (opened previous emails)
- By location (London vs Manchester vs Remote)

### Personalization
Use Brevo's templating:
```html
<p>Hi {{params.name}},</p>
```

Then pass params in the API call:
```typescript
params: {
  name: subscriber.name || "there"
}
```

## 📞 Support

For issues or questions:
1. Check edge function logs in Lovable Cloud
2. Review cron job history in database
3. Verify Brevo API key is set correctly
4. Ensure sender email is verified in Brevo

Happy automating! 🎉
