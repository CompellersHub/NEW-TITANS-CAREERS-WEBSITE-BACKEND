# Abandoned Checkout Email Automation Setup

This system automatically sends a 3-email sequence to customers who start checkout but don't complete their purchase, with progressive discount codes and urgency messaging.

## How It Works

### Email Sequence Timeline

**Email 1: Gentle Reminder (1 hour after abandonment)**
- Subject: "Don't Miss Out on [Course Name]!"
- Message: Friendly reminder about their saved spot
- CTA: Complete enrollment
- No discount

**Email 2: Discount Offer (24 hours after abandonment)**
- Subject: "Exclusive 10% OFF [Course Name] - Limited Time!"
- Discount Code: `COMEBACK10` (10% off)
- Message: Special offer with 48-hour expiration
- Enhanced urgency with social proof

**Email 3: Final Urgency (72 hours after abandonment)**
- Subject: "⏰ Last Chance: 15% OFF [Course Name] Ends Tonight!"
- Discount Code: `LASTCHANCE15` (15% off)
- Message: Final call with maximum urgency
- 24-hour countdown to expiration

## Automatic Tracking

The system automatically tracks:
- ✅ Checkout initiation (when user clicks "Enroll Now")
- ✅ Abandonment detection (no completion after 1 hour)
- ✅ Email sends (prevents duplicate sends)
- ✅ Email opens and clicks (via Brevo tracking)
- ✅ Conversion (if customer completes purchase)

## Database Tables

### `checkout_sessions`
Tracks every checkout attempt:
- Session ID (unique identifier)
- Customer email and name
- Course details and pricing
- Voucher code if applied
- Completion status
- Abandonment flag

### `checkout_abandonment_emails`
Tracks abandonment emails sent:
- Which email in sequence (1, 2, or 3)
- When it was sent
- Discount code included
- Engagement tracking (opens, clicks, conversions)

## Setup Instructions

### 1. Create Voucher Codes

You need to create the discount codes in your system:

1. Go to **Admin Dashboard → Voucher Manager**
2. Create two vouchers:

**Voucher 1: COMEBACK10**
- Discount: 10%
- Valid for: All courses
- Expiration: No expiration (or long expiration)
- Usage limit: Unlimited

**Voucher 2: LASTCHANCE15**
- Discount: 15%
- Valid for: All courses
- Expiration: No expiration (or long expiration)
- Usage limit: Unlimited

### 2. Configure Cron Job

The abandonment emails are sent automatically via a cron job that runs every hour.

**Run this SQL in your Supabase SQL Editor:**

```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule the abandoned checkout processor to run every hour
SELECT cron.schedule(
  'process-abandoned-checkouts',
  '0 * * * *', -- Every hour at minute 0
  $$
  SELECT
    net.http_post(
        url:='https://gfmhhnynyxvmekhvytgg.supabase.co/functions/v1/process-abandoned-checkouts',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmbWhobnlueXh2bWVraHZ5dGdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5ODQwMzEsImV4cCI6MjA3ODU2MDAzMX0.tOf2Y2IwSuBoQ_XBIauovYM5KwbgRZ7fdecWKXvuAU4"}'::jsonb,
        body:=concat('{"triggered_at": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);
```

**Verify the cron job:**
```sql
SELECT * FROM cron.job WHERE jobname = 'process-abandoned-checkouts';
```

### 3. Test the System

**Manual Test (without waiting):**

1. Start a checkout but don't complete it
2. Manually trigger the edge function:
   - Go to Lovable Cloud → Functions
   - Find `process-abandoned-checkouts`
   - Click "Invoke" to run it manually

3. Check if emails were sent:
```sql
SELECT * FROM checkout_abandonment_emails 
ORDER BY sent_at DESC 
LIMIT 10;
```

**Full Flow Test:**

1. Create a test checkout:
   - Use your own email
   - Click "Enroll Now" on any course
   - Close the Stripe checkout without completing

2. Wait 1 hour and check your email for Email #1
3. Wait 24 hours total and check for Email #2
4. Wait 72 hours total and check for Email #3

## Monitoring & Analytics

### View Abandoned Checkouts

```sql
-- See all abandoned checkouts
SELECT 
  cs.email,
  cs.course_title,
  cs.original_price,
  cs.created_at,
  cs.abandoned,
  COUNT(cae.id) as emails_sent
FROM checkout_sessions cs
LEFT JOIN checkout_abandonment_emails cae ON cs.id = cae.checkout_session_id
WHERE cs.completed_at IS NULL
GROUP BY cs.id
ORDER BY cs.created_at DESC;
```

### Check Email Performance

```sql
-- Email sequence performance
SELECT 
  email_sequence_number,
  email_type,
  COUNT(*) as sent,
  SUM(CASE WHEN opened THEN 1 ELSE 0 END) as opens,
  SUM(CASE WHEN clicked THEN 1 ELSE 0 END) as clicks,
  SUM(CASE WHEN converted THEN 1 ELSE 0 END) as conversions,
  ROUND(100.0 * SUM(CASE WHEN opened THEN 1 ELSE 0 END) / COUNT(*), 2) as open_rate,
  ROUND(100.0 * SUM(CASE WHEN clicked THEN 1 ELSE 0 END) / COUNT(*), 2) as click_rate,
  ROUND(100.0 * SUM(CASE WHEN converted THEN 1 ELSE 0 END) / COUNT(*), 2) as conversion_rate
FROM checkout_abandonment_emails
GROUP BY email_sequence_number, email_type
ORDER BY email_sequence_number;
```

### Recovery Rate

```sql
-- Overall recovery statistics
SELECT 
  COUNT(*) as total_abandoned,
  SUM(CASE WHEN completed_at IS NOT NULL THEN 1 ELSE 0 END) as recovered,
  ROUND(100.0 * SUM(CASE WHEN completed_at IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*), 2) as recovery_rate,
  SUM(original_price) as potential_revenue,
  SUM(CASE WHEN completed_at IS NOT NULL THEN original_price ELSE 0 END) as recovered_revenue
FROM checkout_sessions
WHERE abandoned = true;
```

## Customization

### Change Email Timing

Edit `supabase/functions/process-abandoned-checkouts/index.ts`:

```typescript
// Change these values (in hours):
if (hoursOld >= 1 && !sentSequences.has(1)) { // Email 1 timing
if (hoursOld >= 24 && !sentSequences.has(2)) { // Email 2 timing
if (hoursOld >= 72 && !sentSequences.has(3)) { // Email 3 timing
```

### Change Discount Codes

Edit the discount codes in the edge function:
```typescript
discountCode = "COMEBACK10"; // Email 2
discountCode = "LASTCHANCE15"; // Email 3
```

### Customize Email Content

Edit the email templates in `supabase/functions/process-abandoned-checkouts/index.ts`:
- Search for `emailToSend` objects
- Modify `subject` and `content` fields
- Keep the course link structure intact

### Change Cron Frequency

```sql
-- Run every 30 minutes instead of hourly:
SELECT cron.schedule(
  'process-abandoned-checkouts',
  '*/30 * * * *', -- Every 30 minutes
  ...
);

-- Run every 6 hours:
SELECT cron.schedule(
  'process-abandoned-checkouts',
  '0 */6 * * *', -- Every 6 hours
  ...
);
```

## Email Tracking

Brevo automatically tracks:
- **Opens**: When recipient opens the email
- **Clicks**: When recipient clicks any link
- **Conversions**: When recipient completes purchase

You can view these stats in:
1. Brevo Dashboard → Campaigns → Transactional Emails
2. Your database: `checkout_abandonment_emails` table
3. Custom analytics queries (see above)

## Best Practices

### Discount Strategy
- Start with no discount (test if reminder alone works)
- Increase discount progressively (10% → 15%)
- Time-limit all discounts to create urgency
- Track which discount performs best

### Email Timing
- Email 1: Quick reminder while interest is fresh
- Email 2: Give enough time to reconsider (24h)
- Email 3: Final push before interest fades (72h)
- Don't send more than 3 emails (avoid spam)

### Message Tone
- Email 1: Helpful and friendly
- Email 2: Value-focused with urgency
- Email 3: Maximum urgency, final offer

### Testing & Optimization
1. A/B test subject lines
2. Test different discount amounts
3. Experiment with email timing
4. Try different urgency messaging
5. Test with/without social proof elements

## Troubleshooting

### Emails Not Sending

**Check cron job is running:**
```sql
SELECT * FROM cron.job_run_details 
WHERE jobname = 'process-abandoned-checkouts'
ORDER BY start_time DESC
LIMIT 10;
```

**Check edge function logs:**
1. Go to Lovable Cloud → Functions
2. Click on `process-abandoned-checkouts`
3. View logs for errors

**Verify Brevo API key:**
- Check that `BREVO_API_KEY` secret is set
- Test API key in Brevo dashboard

### Duplicate Emails

The system prevents duplicates automatically via:
- Unique constraint on `(checkout_session_id, email_sequence_number)`
- Check before send: `!sentSequences.has(1)`

If duplicates occur, check database constraints.

### Tracking Not Working

**Email opens/clicks:**
- Brevo tracks these automatically
- Requires images enabled in email client
- Some clients block tracking pixels

**Conversions:**
- Implement conversion tracking in thank you page
- Update `checkout_abandonment_emails.converted = true`

## Privacy & Compliance

### GDPR Compliance
- Only send to users who initiated checkout (legitimate interest)
- Include unsubscribe link in emails
- Honor unsubscribe requests immediately
- Delete data upon request

### Email Content
- Always include company name and address
- Provide clear unsubscribe option
- Don't mislead with subject lines
- Respect "do not email" lists

### Data Retention
```sql
-- Delete old abandoned checkouts (e.g., after 90 days)
DELETE FROM checkout_sessions
WHERE created_at < NOW() - INTERVAL '90 days'
AND completed_at IS NULL;
```

## Performance Optimization

### For High Volume

1. **Batch processing**: Process in chunks
2. **Rate limiting**: Add delays between Brevo API calls
3. **Indexes**: Already created on key columns
4. **Cleanup**: Archive old sessions regularly

### Cost Optimization

**Brevo limits (free plan):**
- 300 emails/day
- Adjust timing if you hit limits
- Consider upgrading for higher volume

**Reduce email sends:**
- Require email capture before checkout
- Only send to qualified leads
- Stop after email 3 (don't spam)

## Support

For issues or questions:
1. Check edge function logs
2. Review cron job execution
3. Verify Brevo API status
4. Test with manual trigger first

## Next Steps

Once the system is running:
- ✅ Monitor recovery rates weekly
- ✅ A/B test email variants
- ✅ Optimize discount amounts
- ✅ Analyze which courses convert best
- ✅ Segment by course price/type
- ✅ Add SMS reminders (future enhancement)
