# Form Analytics Alerts Setup

## Overview
Automated email alerts notify administrators when form performance issues are detected, including high abandonment rates and field-level errors.

## Features

### 1. Automated Daily Monitoring
- **Cron Job**: Runs daily at 9:00 AM UTC
- **Analysis Period**: Last 24 hours of form data
- **Smart Thresholds**: Only alerts when minimum session requirements are met

### 2. Alert Triggers

**Abandonment Rate Alert**
- Triggered when: Abandonment rate exceeds 30%
- Formula: `(step_abandons / total_interactions) × 100`
- Requires: Minimum 5 unique sessions

**Field Error Alert**
- Triggered when: Field errors exceed 10 occurrences
- Tracks: Specific error messages and patterns
- Groups: By form and field name

### 3. Email Notifications
- **Beautiful HTML Emails**: Professional, branded alert emails
- **Detailed Metrics**: Includes actual values vs. thresholds
- **Actionable Insights**: Recommendations for improving form UX
- **Direct Links**: Quick access to analytics dashboard

## Configuration

### Update Admin Email
Before deploying to production, update the admin email in the edge function:

```typescript
// In supabase/functions/form-analytics-alerts/index.ts (line ~166)
const adminEmail = "admin@yourdomain.com"; // ⚠️ UPDATE THIS
```

### Customize Thresholds
Modify default thresholds in the edge function:

```typescript
const DEFAULT_THRESHOLDS: AlertThresholds = {
  abandonmentRate: 30,    // percentage
  fieldErrorCount: 10,     // absolute count
  minimumSessions: 5,      // minimum sessions before alerting
};
```

### Adjust Cron Schedule
The current schedule runs daily at 9:00 AM UTC. To change:

```sql
-- View existing cron jobs
SELECT * FROM cron.job;

-- Unschedule the current job
SELECT cron.unschedule('daily-form-analytics-alerts');

-- Create new schedule (example: every 6 hours)
SELECT cron.schedule(
  'daily-form-analytics-alerts',
  '0 */6 * * *', -- Every 6 hours
  $$
  SELECT
    net.http_post(
        url:='https://YOUR_PROJECT_ID.supabase.co/functions/v1/form-analytics-alerts',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb,
        body:=concat('{"time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);
```

## Testing

### Manual Test
Visit `/form-alert-settings` and click "Test Alert Now" to trigger a manual check.

### Edge Function Test
Call the edge function directly:

```bash
curl -X POST \
  https://YOUR_PROJECT_ID.supabase.co/functions/v1/form-analytics-alerts \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"
```

### View Logs
Check edge function logs in Lovable Cloud:
1. Click "Cloud" tab
2. Navigate to "Edge Functions"
3. Select "form-analytics-alerts"
4. View execution logs

## Pages & Routes

### `/form-analytics` 
View comprehensive form analytics dashboard
- Field-level performance metrics
- Step completion/abandonment rates
- Time-on-field analysis
- Error frequency tracking

### `/form-alert-settings`
Configure alert thresholds and email preferences
- Customize abandonment rate threshold
- Set field error count threshold
- Update admin email address
- Test alerts manually

## Database Schema

### `form_analytics` Table
Tracks all form interaction events:
- `form_name`: Identifier for the form
- `step_number`: Current step in multi-step forms
- `field_name`: Specific field identifier
- `event_type`: Type of event (focus, blur, error, complete, abandon)
- `time_spent_ms`: Time spent on field/step
- `error_message`: Validation error details
- `session_id`: Unique session identifier

### `form_analytics_summary` View
Aggregated metrics for quick analysis:
- Total events and unique sessions
- Average time spent per field
- Error counts and abandonment rates
- Completion statistics

## How It Works

### 1. Data Collection
The `useFormAnalytics` hook automatically tracks:
- Field focus/blur events with timing
- Validation errors with messages
- Step completions and abandonments
- Form completion status

### 2. Automated Analysis
Daily cron job (9:00 AM UTC):
1. Queries last 24 hours of analytics data
2. Groups by form and calculates metrics
3. Compares against defined thresholds
4. Generates alerts for violations

### 3. Email Notification
When thresholds are exceeded:
1. Generates detailed HTML email
2. Groups alerts by form
3. Includes metrics and recommendations
4. Sends to configured admin email(s)

## Email Service Setup

### Resend Configuration
The system uses Resend for email delivery:

1. **Verify Domain**: https://resend.com/domains
2. **Get API Key**: https://resend.com/api-keys
3. **Update Secret**: Already configured as `RESEND_API_KEY`

### Email Sender
Update the "from" address in the edge function:

```typescript
from: "Form Analytics <onboarding@resend.dev>", // ⚠️ UPDATE THIS
```

## Troubleshooting

### No Alerts Received
1. Check cron job is running: `SELECT * FROM cron.job;`
2. Verify minimum sessions threshold is met (default: 5)
3. Check edge function logs for errors
4. Confirm admin email is correct
5. Verify Resend domain is validated

### False Positives
- Increase `minimumSessions` threshold
- Adjust `abandonmentRate` percentage
- Raise `fieldErrorCount` threshold

### Missing Data
- Ensure forms use `ValidatedMultiStepForm` component
- Verify `formName` prop is set correctly
- Check `form_analytics` table has recent data

## Best Practices

1. **Form Naming**: Use consistent, descriptive form names
2. **Session Tracking**: Each form gets unique session ID automatically
3. **User Privacy**: No PII stored in analytics (only email if provided)
4. **Testing**: Always test alerts after threshold changes
5. **Monitoring**: Review analytics dashboard weekly

## Security

- RLS policies restrict analytics viewing to admins only
- Anonymous users can insert tracking data
- Email addresses only stored for authenticated actions
- Session IDs are randomized, not linked to user accounts

## Future Enhancements

Potential improvements:
- Multiple admin email addresses
- Slack/Discord webhook integration
- Custom alert schedules per form
- Trend analysis (week-over-week comparisons)
- Automated form optimization suggestions
- A/B test integration for form variants
