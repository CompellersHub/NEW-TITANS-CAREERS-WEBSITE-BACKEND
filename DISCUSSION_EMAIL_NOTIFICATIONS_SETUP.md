# Discussion Email Notifications Setup Guide

This guide explains how to configure email notifications for course discussion forums.

## Features Implemented

### 1. Email Notification Types
- **Reply Notifications**: Get notified when someone replies to your discussion threads
- **Mention Notifications**: Get notified when someone mentions you using @yourname in a reply

### 2. Notification Frequencies
- **Instant**: Receive emails immediately when events occur
- **Daily Digest**: Receive a summary once per day at your preferred time
- **Weekly Digest**: Receive a summary once per week (Mondays) at your preferred time

### 3. User Preferences
Users can control their notification settings in their profile at `/profile?tab=notifications`:
- Toggle reply notifications on/off
- Toggle mention notifications on/off
- Choose frequency (instant, daily, weekly)
- Set preferred time for digest emails (0-23 hours)

## Database Tables Created

### `email_notification_preferences`
Stores user preferences for email notifications:
- `user_id`: References the user
- `reply_notifications`: Boolean to enable/disable reply emails
- `mention_notifications`: Boolean to enable/disable mention emails
- `frequency`: 'instant', 'daily', or 'weekly'
- `digest_time`: Hour (0-23) for digest delivery
- `last_digest_sent_at`: Timestamp of last digest sent

### `queued_email_notifications`
Temporary storage for notifications that will be sent in digests:
- `user_id`: Recipient user
- `notification_type`: 'reply' or 'mention'
- `subject`: Email subject
- `content`: Email content
- `metadata`: Additional data (thread_id, course_slug, etc.)
- `sent`: Boolean flag marking if sent

### `user_notifications`
In-app notifications with realtime updates:
- Already existed, enhanced with discussion support
- Realtime subscriptions enabled for instant UI updates

## Edge Functions

### `send-discussion-email`
Sends instant email notifications for discussion events.

**Triggered by**: Database triggers when new replies or mentions occur
**Checks**: User's email preferences before sending
**Uses**: Resend API to send formatted HTML emails

### `send-digest-emails`
Processes and sends daily/weekly digest emails.

**How it works**:
1. Runs every hour via cron job
2. Checks users with digest preferences matching current hour
3. Gathers queued notifications for each user
4. Sends consolidated digest email
5. Marks notifications as sent
6. Updates last_digest_sent_at timestamp

## Setup Steps

### 1. Verify Resend Configuration
Make sure you have:
- Created a Resend account at https://resend.com
- Verified your sending domain at https://resend.com/domains
- Created an API key at https://resend.com/api-keys
- The `RESEND_API_KEY` secret is already configured in your project ✓

### 2. Set Up Cron Job for Digest Emails

Run the SQL from `DIGEST_EMAILS_CRON_SETUP.sql` in your backend to enable scheduled digest sending:

```sql
SELECT cron.schedule(
  'send-digest-emails',
  '0 * * * *', -- Every hour
  $$ ... $$
);
```

### 3. Update Email Domain
In both edge functions, replace `notifications@resend.dev` with your verified domain:
- `send-discussion-email/index.ts` line 38
- `send-digest-emails/index.ts` line 158

Example: `notifications@yourdomain.com`

### 4. Update App URLs in Emails
Replace placeholder URLs in the email templates with your actual app domain:
- In `send-discussion-email/index.ts` line 33
- In `send-digest-emails/index.ts` throughout the email HTML

## How It Works

### Instant Notifications
1. User posts a reply → triggers `notify_thread_author()` function
2. Function checks if thread author has instant notifications enabled
3. Calls `send_email_notification()` which triggers edge function
4. Email sent immediately via Resend

### Mentions
1. Reply content is scanned for @username patterns
2. `notify_mentions()` function finds matching users
3. Creates in-app notification + queues/sends email based on preferences

### Digest Emails
1. Cron job runs every hour
2. Checks users with digest preferences for current hour
3. Gathers unsent notifications from queue
4. Sends consolidated email with up to 10 recent notifications
5. Marks notifications as sent

## User Experience

### Setting Preferences
1. Navigate to Profile → Notifications tab
2. Toggle notification types on/off
3. Select frequency (instant/daily/weekly)
4. Choose preferred time for digests
5. Save preferences

### Email Format
All emails include:
- Branded header with Titans Careers logo
- Clear notification content
- Preview of reply/mention text
- Direct link to view discussion
- Link to manage preferences

## Testing

1. Create a discussion thread
2. Have another user reply to it
3. Check that notification appears in bell icon (instant)
4. Check email based on preferences:
   - Instant: Email arrives immediately
   - Digest: Email arrives at scheduled time

## Monitoring

Check edge function logs for:
- `send-discussion-email`: Instant notification delivery
- `send-digest-emails`: Digest processing and sending

View logs at: Backend → Edge Functions → Select function → Logs

## Notes

- Browser notifications also enabled for in-app real-time alerts
- Notifications are only sent to enrolled students
- Users can delete or mark notifications as read
- Thread authors don't receive notifications for their own replies
- Mention detection is case-insensitive
