# Abandoned Checkout Multi-Channel Recovery Setup

This system automatically sends a 3-step recovery sequence via **Email AND SMS** to customers who start checkout but don't complete their purchase, with progressive discount codes and urgency messaging.

## Multi-Channel Recovery Strategy

### Why Email + SMS?
- **Email**: Detailed content, visual design, links to course pages
- **SMS**: Immediate delivery, high open rates (98%), mobile-friendly
- **Combined**: 3x higher recovery rate than email alone

### Recovery Timeline

**Step 1: Gentle Reminder (1 hour after abandonment)**
- 📧 Email: Detailed reminder about their saved spot
- 📱 SMS: Quick reminder with direct link
- No discount offered yet

**Step 2: Discount Offer (24 hours after abandonment)**
- 📧 Email: Detailed offer with 10% discount code
- 📱 SMS: Quick offer notification
- Discount Code: `COMEBACK10` (10% off)
- Valid for 48 hours

**Step 3: Final Urgency (72 hours after abandonment)**
- 📧 Email: Final call with maximum urgency
- 📱 SMS: Last chance notification
- Discount Code: `LASTCHANCE15` (15% off)
- Expires in 24 hours

## How It Works

### Automatic Tracking

The system automatically tracks:
- ✅ Checkout initiation (when user clicks "Enroll Now")
- ✅ User email, name, and phone number (if provided)
- ✅ Abandonment detection (no completion after 1 hour)
- ✅ Email and SMS sends (prevents duplicate sends)
- ✅ Engagement tracking (opens, clicks, conversions)
- ✅ Multi-channel coordination (sends both email and SMS)

### Phone Number Collection

Phone numbers are collected from:
1. **Contact Form**: Optional phone field
2. **Stored in localStorage**: Used for checkout tracking
3. **Only SMS sent if phone provided**: Email always sent

## Database Tables

### `checkout_sessions`
Tracks every checkout attempt:
- Session ID (unique identifier)
- Customer email, name, and phone
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

### `checkout_abandonment_sms`
Tracks abandonment SMS sent:
- Which SMS in sequence (1, 2, or 3)
- When it was sent
- Discount code included
- Delivery and engagement tracking

## Setup Instructions

### 1. Configure Brevo SMS

**Prerequisites:**
- Brevo account (free tier includes SMS)
- Verified sender name for SMS

**Steps:**

1. Go to Brevo Dashboard → **SMS**
2. Set up your SMS sender name (max 11 characters, e.g., "TitansAcad")
3. Buy SMS credits (pay as you go, starting from $0.038 per SMS)
4. Your existing `BREVO_API_KEY` works for both email and SMS!

**SMS Sender Requirements:**
- Must be alphanumeric (no special characters)
- Max 11 characters
- Will appear as sender name on recipients' phones

### 2. Create Voucher Codes

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

### 3. Configure Cron Job

The abandonment processor runs automatically via a cron job every hour.

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

### 4. Test the System

**Manual Test (without waiting):**

1. Fill out the contact form with your phone number
2. Start a checkout but don't complete it
3. Manually trigger the edge function:
   - Go to Lovable Cloud → Functions
   - Find `process-abandoned-checkouts`
   - Click "Invoke" to run it manually

4. Check if emails and SMS were sent:
```sql
-- Check emails
SELECT * FROM checkout_abandonment_emails 
ORDER BY sent_at DESC 
LIMIT 10;

-- Check SMS
SELECT * FROM checkout_abandonment_sms 
ORDER BY sent_at DESC 
LIMIT 10;
```

**Full Flow Test:**

1. Create a test checkout:
   - Fill out contact form with your phone
   - Use your own email
   - Click "Enroll Now" on any course
   - Close the Stripe checkout without completing

2. Wait for automatic processing (or trigger manually)
3. Check your email and phone for messages

## SMS Message Examples

### SMS 1 (1 hour):
```
Hi John! You left AWS Solutions Architect in your cart. Complete your enrollment now: https://gfmhhnynyxvmekhvytgg.supabase.co/courses/aws-solutions-architect
```

### SMS 2 (24 hours):
```
🎉 Special offer! Get 10% OFF AWS Solutions Architect with code COMEBACK10. Valid 48hrs: https://gfmhhnynyxvmekhvytgg.supabase.co/courses/aws-solutions-architect
```

### SMS 3 (72 hours):
```
⏰ LAST CHANCE! 15% OFF AWS Solutions Architect with code LASTCHANCE15. Expires tonight: https://gfmhhnynyxvmekhvytgg.supabase.co/courses/aws-solutions-architect
```

## Email Message Structure

All emails include:
- Personalized greeting (uses customer name)
- Course details and benefits
- Clear call-to-action button
- Discount code (for emails 2 & 3)
- Social proof elements
- Urgency messaging
- Contact information

## Analytics & Monitoring

### Check Recovery Performance

**Email Performance:**
```sql
SELECT 
  email_sequence_number,
  COUNT(*) as sent,
  SUM(CASE WHEN opened THEN 1 ELSE 0 END) as opened,
  SUM(CASE WHEN clicked THEN 1 ELSE 0 END) as clicked,
  SUM(CASE WHEN converted THEN 1 ELSE 0 END) as converted,
  ROUND(SUM(CASE WHEN opened THEN 1 ELSE 0 END)::numeric / COUNT(*) * 100, 2) as open_rate,
  ROUND(SUM(CASE WHEN clicked THEN 1 ELSE 0 END)::numeric / COUNT(*) * 100, 2) as click_rate,
  ROUND(SUM(CASE WHEN converted THEN 1 ELSE 0 END)::numeric / COUNT(*) * 100, 2) as conversion_rate
FROM checkout_abandonment_emails
GROUP BY email_sequence_number
ORDER BY email_sequence_number;
```

**SMS Performance:**
```sql
SELECT 
  sms_sequence_number,
  COUNT(*) as sent,
  SUM(CASE WHEN delivered THEN 1 ELSE 0 END) as delivered,
  SUM(CASE WHEN clicked THEN 1 ELSE 0 END) as clicked,
  SUM(CASE WHEN converted THEN 1 ELSE 0 END) as converted,
  ROUND(SUM(CASE WHEN delivered THEN 1 ELSE 0 END)::numeric / COUNT(*) * 100, 2) as delivery_rate,
  ROUND(SUM(CASE WHEN converted THEN 1 ELSE 0 END)::numeric / COUNT(*) * 100, 2) as conversion_rate
FROM checkout_abandonment_sms
GROUP BY sms_sequence_number
ORDER BY sms_sequence_number;
```

**Overall Recovery Rate:**
```sql
SELECT 
  COUNT(*) as total_abandoned,
  SUM(CASE WHEN completed_at IS NOT NULL THEN 1 ELSE 0 END) as recovered,
  ROUND(SUM(CASE WHEN completed_at IS NOT NULL THEN 1 ELSE 0 END)::numeric / COUNT(*) * 100, 2) as recovery_rate
FROM checkout_sessions
WHERE abandoned = true;
```

### View Recent Activity

```sql
-- Last 24 hours of abandonments
SELECT 
  cs.email,
  cs.name,
  cs.phone,
  cs.course_title,
  cs.created_at,
  cs.abandoned,
  COUNT(DISTINCT cae.id) as emails_sent,
  COUNT(DISTINCT cas.id) as sms_sent
FROM checkout_sessions cs
LEFT JOIN checkout_abandonment_emails cae ON cs.id = cae.checkout_session_id
LEFT JOIN checkout_abandonment_sms cas ON cs.id = cas.checkout_session_id
WHERE cs.created_at > NOW() - INTERVAL '24 hours'
GROUP BY cs.id, cs.email, cs.name, cs.phone, cs.course_title, cs.created_at, cs.abandoned
ORDER BY cs.created_at DESC;
```

## Cost Estimation

### Brevo SMS Pricing
- UK SMS: ~£0.038 per SMS
- Average 3-step sequence: £0.114 per customer
- Only charged for customers with phone numbers
- Email remains free (300/day on free tier)

### ROI Calculation
- Average course price: £500
- Recovery sequence cost: £0.114
- If just 1% of abandoned carts recover: 50x ROI
- Industry average recovery rate: 15-20%

## Troubleshooting

### SMS Not Sending

1. **Check Brevo SMS Credits:**
   - Go to Brevo Dashboard → SMS
   - Verify you have SMS credits

2. **Check Sender Name:**
   - Must be alphanumeric, max 11 chars
   - Update in edge function if needed

3. **Check Phone Format:**
   - Must include country code (e.g., +44 for UK)
   - Stored in international format

4. **Check Edge Function Logs:**
   - Go to Lovable Cloud → Functions
   - View `process-abandoned-checkouts` logs

### Email Not Sending

1. **Check Brevo API Key:**
   - Verify `BREVO_API_KEY` is set in secrets
   
2. **Check Sender Domain:**
   - Must be verified in Brevo dashboard
   - Update sender email in edge function if needed

3. **Check Daily Limits:**
   - Free tier: 300 emails/day
   - Upgrade if needed

### Phone Number Not Captured

1. **Check Contact Form:**
   - Verify user filled in phone field
   - Check localStorage in browser console:
   ```javascript
   localStorage.getItem('userPhone')
   ```

2. **Check Database:**
```sql
SELECT phone FROM checkout_sessions 
WHERE email = 'user@example.com'
ORDER BY created_at DESC LIMIT 1;
```

## Best Practices

### Timing Optimization
- Test different time intervals for your audience
- Current settings (1h, 24h, 72h) work well for most
- Can adjust in edge function if needed

### Message Personalization
- Always include customer name when available
- Reference specific course they abandoned
- Show exact pricing with discounts

### Discount Strategy
- Start with no discount (test if reminder works alone)
- Progressive discounts create urgency
- Limited time offers increase conversion

### A/B Testing Ideas
- Test different discount amounts
- Test different urgency messaging
- Test SMS vs Email vs Both
- Test different timing intervals

## Compliance

### GDPR & Privacy
- ✅ Phone numbers collected with consent
- ✅ Clear opt-in on contact form
- ✅ Data stored securely in Supabase
- ✅ Users can request data deletion

### SMS Regulations
- Only send to opted-in numbers
- Include company name in messages
- Honor opt-out requests immediately
- Keep messages concise and relevant

## Support

For issues or questions:
- Check edge function logs in Lovable Cloud
- Review Brevo dashboard for delivery status
- Contact Brevo support for SMS/email issues
- Check Supabase logs for database issues

## Future Enhancements

Potential improvements:
- [ ] WhatsApp integration (higher engagement)
- [ ] A/B testing different message variants
- [ ] Dynamic discount calculation
- [ ] Custom timing based on user behavior
- [ ] Integration with CRM systems
- [ ] Advanced analytics dashboard
- [ ] Predictive abandonment prevention
