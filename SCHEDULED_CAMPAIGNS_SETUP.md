# Scheduled Voucher Campaigns Setup

## Overview
Automatically send voucher codes to email lists or subscriber segments at specific dates and times with support for recurring campaigns (daily, weekly, monthly).

## Database Setup
✅ **Already Completed**: The `scheduled_voucher_campaigns` table has been created with:
- Schedule configuration (date, time, recurrence)
- Recipient targeting (segments or manual emails)
- Email customization (subject, message)
- Status tracking (scheduled, sent, cancelled, failed)
- Automatic next_send_at calculation for recurring campaigns

## Edge Function Setup

### Process Scheduled Campaigns Function
The `process-scheduled-campaigns` edge function checks for due campaigns and sends them automatically.

**Function URL:**
```
https://gfmhhnynyxvmekhvytgg.supabase.co/functions/v1/process-scheduled-campaigns
```

### Setting Up Automated Processing (Cron Job)

To enable automatic campaign processing, you need to set up a cron job in your database.

**Run this SQL in Lovable Cloud → Database → SQL Editor:**

```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule campaign processor to run every 5 minutes
SELECT cron.schedule(
  'process-scheduled-voucher-campaigns',
  '*/5 * * * *', -- Every 5 minutes
  $$
  SELECT net.http_post(
    url:='https://gfmhhnynyxvmekhvytgg.supabase.co/functions/v1/process-scheduled-campaigns',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmbWhobnlueXh2bWVraHZ5dGdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5ODQwMzEsImV4cCI6MjA3ODU2MDAzMX0.tOf2Y2IwSuBoQ_XBIauovYM5KwbgRZ7fdecWKXvuAU4"}'::jsonb,
    body:='{}'::jsonb
  ) as request_id;
  $$
);
```

### Verify Cron Job
```sql
-- Check if cron job was created successfully
SELECT * FROM cron.job WHERE jobname = 'process-scheduled-voucher-campaigns';

-- View cron job run history
SELECT * FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'process-scheduled-voucher-campaigns')
ORDER BY start_time DESC 
LIMIT 10;
```

### Cron Schedule Options
Adjust the schedule expression in the cron.schedule call:

```sql
-- Every 5 minutes (recommended for timely delivery)
'*/5 * * * *'

-- Every 15 minutes
'*/15 * * * *'

-- Every hour at the top of the hour
'0 * * * *'

-- Every day at 9 AM UTC
'0 9 * * *'
```

## Features

### 1. Schedule Campaigns
- Set specific date and time for voucher delivery
- Choose recipients: subscriber segments or manual email list
- Customize email subject and message
- Set recurrence pattern (one-time, daily, weekly, monthly)

### 2. Recurring Campaigns
- **Daily**: Sends every 24 hours from the initial scheduled time
- **Weekly**: Sends every 7 days from the initial scheduled time
- **Monthly**: Sends every month from the initial scheduled time
- Automatic calculation of next_send_at timestamp

### 3. Campaign Management
- View all scheduled campaigns with status
- See next send time and last sent time
- Cancel scheduled campaigns
- Reactivate cancelled campaigns
- Delete completed or unwanted campaigns

### 4. Status Tracking
- **Scheduled**: Campaign is active and waiting for scheduled time
- **Sent**: One-time campaign has been sent successfully
- **Cancelled**: Campaign has been manually cancelled
- **Failed**: Campaign encountered an error during sending

## Usage

### Creating a Scheduled Campaign

1. **From Voucher Manager**:
   - Click the calendar icon on any voucher card
   - Or use the "Scheduled Campaigns" button at the top

2. **Configure Campaign**:
   - Select date and time for sending
   - Choose recurrence pattern (or one-time)
   - Select recipients (segment or manual emails)
   - Customize email subject and message

3. **Confirm**: Click "Schedule Campaign" to save

### Managing Campaigns

Visit **Admin → Scheduled Campaigns** to:
- View all campaigns with their status
- See upcoming send times
- Cancel or reactivate campaigns
- Delete old campaigns
- Monitor delivery history

## Email Template
Scheduled campaigns use the same beautiful voucher email template as manual distributions, including:
- Prominent voucher code display
- Discount details and terms
- Expiration information
- Course applicability
- Usage instructions
- Direct link to course catalog

## Best Practices

1. **Timing**:
   - Schedule campaigns during business hours in recipient time zones
   - Avoid weekends for B2B campaigns
   - Test timing with a small segment first

2. **Recurrence**:
   - Use monthly recurrence for ongoing promotions
   - Use weekly for limited-time offers
   - Consider seasonal patterns in your industry

3. **Segmentation**:
   - Target engaged subscribers for best results
   - Create separate campaigns for different customer segments
   - Use tags to fine-tune recipient selection

4. **Testing**:
   - Test campaigns with a small manual email list first
   - Verify email rendering and voucher codes
   - Check that links work correctly

5. **Monitoring**:
   - Review campaign history regularly
   - Check cron job execution logs
   - Monitor voucher redemption rates

## Troubleshooting

### Campaign Not Sending
1. Check cron job is running: Query `cron.job` table
2. Verify campaign status is "scheduled"
3. Check `next_send_at` is in the past
4. Review edge function logs for errors

### Cron Job Not Running
1. Ensure `pg_cron` extension is enabled
2. Verify cron schedule syntax is correct
3. Check database permissions
4. Review `cron.job_run_details` for error messages

### Email Not Delivered
1. Verify RESEND_API_KEY is configured
2. Check sender email is verified in Resend
3. Review segment filters if using segments
4. Validate email addresses in manual list

## API Endpoints

### Process Campaigns (Automated)
```
POST https://gfmhhnynyxvmekhvytgg.supabase.co/functions/v1/process-scheduled-campaigns
```

This endpoint is called automatically by the cron job but can be triggered manually for testing.

### Response Format
```json
{
  "message": "Campaigns processed",
  "processed": 2,
  "results": [
    {
      "campaignId": "uuid",
      "success": true,
      "recipientCount": 45
    }
  ]
}
```

## Database Tables

### scheduled_voucher_campaigns
Stores campaign configuration and scheduling information.

Key columns:
- `voucher_id`: Reference to voucher
- `segment_id`: Target segment (optional)
- `manual_emails`: Array of email addresses (optional)
- `scheduled_time`: Initial send time
- `next_send_at`: Next scheduled send (auto-calculated)
- `recurrence_type`: none/daily/weekly/monthly
- `status`: scheduled/sent/cancelled/failed
- `last_sent_at`: Timestamp of last send

### voucher_distributions
Tracks each send event for analytics and record-keeping.

## Related Features
- **Bulk Voucher Creation**: Generate multiple codes at once
- **Email Distribution**: Send vouchers immediately to segments
- **Voucher Analytics**: Track campaign performance
- **CSV Export**: Download voucher and distribution data

## Next Steps
1. Set up the cron job using the SQL above
2. Create your first scheduled campaign
3. Monitor the first few sends to ensure proper delivery
4. Adjust cron frequency if needed based on volume
5. Review analytics to optimize campaign timing
