# Recovery Alerts System Setup Guide

## Overview
The Recovery Alerts System provides automated monitoring and email notifications when your tri-channel recovery system (Email, SMS, WhatsApp) performance drops below configured thresholds.

## Features
- **Real-time Monitoring**: Tracks conversion rates and ROI across all channels
- **Customizable Thresholds**: Set specific targets for each channel
- **Smart Cooldown**: Prevents alert fatigue with configurable cooldown periods
- **Detailed Reports**: Rich HTML emails with actionable insights
- **Alert History**: Complete audit trail of all sent alerts

## Database Schema

### recovery_alert_settings
```sql
CREATE TABLE recovery_alert_settings (
  id UUID PRIMARY KEY,
  admin_email TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  
  -- Conversion rate thresholds (percentages)
  email_conversion_threshold NUMERIC DEFAULT 5.0,
  sms_conversion_threshold NUMERIC DEFAULT 8.0,
  whatsapp_conversion_threshold NUMERIC DEFAULT 10.0,
  overall_conversion_threshold NUMERIC DEFAULT 7.0,
  
  -- ROI thresholds (percentages)
  email_roi_threshold NUMERIC DEFAULT 0,
  sms_roi_threshold NUMERIC DEFAULT 0,
  whatsapp_roi_threshold NUMERIC DEFAULT 0,
  overall_roi_threshold NUMERIC DEFAULT 0,
  
  -- Alert frequency
  check_interval_hours INTEGER DEFAULT 24,
  alert_cooldown_hours INTEGER DEFAULT 6,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### recovery_alert_history
```sql
CREATE TABLE recovery_alert_history (
  id UUID PRIMARY KEY,
  alert_type TEXT NOT NULL, -- 'conversion_drop' or 'negative_roi'
  channel TEXT NOT NULL, -- 'email', 'sms', 'whatsapp', or 'overall'
  metric_value NUMERIC NOT NULL,
  threshold_value NUMERIC NOT NULL,
  admin_email TEXT NOT NULL,
  alert_data JSONB DEFAULT '{}',
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

## Alert Configuration

### Access Settings
Navigate to: `/admin/recovery-alert-settings`

### Default Thresholds

#### Conversion Rate Alerts
- **Email**: 5% (industry average: 5-8%)
- **SMS**: 8% (industry average: 8-12%)
- **WhatsApp**: 10% (industry average: 10-15%)
- **Overall**: 7% (combined average)

#### ROI Alerts
- **All Channels**: 0% (alerts on negative ROI)
- Recommended: Set to 50% for early warning

### Configuration Options

1. **Enable/Disable Alerts**
   - Toggle system on/off without losing settings

2. **Admin Email**
   - Email address to receive alerts
   - Must be valid and monitored

3. **Check Interval** (1-168 hours)
   - How often to check metrics
   - Recommended: 24 hours for daily monitoring
   - High-volume: 6-12 hours

4. **Alert Cooldown** (1-72 hours)
   - Prevents duplicate alerts
   - Recommended: 6 hours minimum
   - Critical alerts: 3 hours

## Edge Function: check-recovery-alerts

### Functionality
```typescript
// Calculates metrics for last 24 hours
- Email: conversion rate, ROI, costs
- SMS: conversion rate, ROI, costs  
- WhatsApp: conversion rate, ROI, costs
- Overall: combined metrics

// Checks thresholds
- Conversion rate drops
- Negative or low ROI
- Cooldown period verification

// Sends alerts
- HTML email via Resend
- Records in alert_history
```

### Deployment
The function is automatically deployed with your project.

**Manual Test:**
```bash
curl -X POST \
  https://your-project.supabase.co/functions/v1/check-recovery-alerts \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

## Automated Monitoring Setup

### Cron Job Configuration

**Option 1: Supabase Cron (Recommended)**
```sql
SELECT cron.schedule(
  'check-recovery-alerts-daily',
  '0 9 * * *', -- Every day at 9 AM
  $$
  SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/check-recovery-alerts',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb,
    body := '{}'::jsonb
  ) as request_id;
  $$
);
```

**Option 2: Multiple Daily Checks**
```sql
-- Every 6 hours
SELECT cron.schedule(
  'check-recovery-alerts-6h',
  '0 */6 * * *',
  $$ ... $$
);
```

**Option 3: Hourly Monitoring**
```sql
-- Every hour
SELECT cron.schedule(
  'check-recovery-alerts-hourly',
  '0 * * * *',
  $$ ... $$
);
```

### External Cron Services

**Cron-job.org:**
```
URL: https://your-project.supabase.co/functions/v1/check-recovery-alerts
Method: POST
Schedule: 0 9 * * * (daily at 9 AM)
Headers:
  Authorization: Bearer YOUR_ANON_KEY
```

**GitHub Actions:**
```yaml
name: Recovery Alerts Check
on:
  schedule:
    - cron: '0 9 * * *'
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Alert Check
        run: |
          curl -X POST \
            ${{ secrets.SUPABASE_URL }}/functions/v1/check-recovery-alerts \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}"
```

## Alert Email Format

### Email Structure
```
Subject: ⚠️ Recovery System Alert: X Threshold(s) Breached

Header: Recovery System Alert (gradient purple)

Section 1: Low Conversion Rate Alerts (red border)
- Channel name
- Current rate vs threshold
- Messages sent
- Conversions

Section 2: Low/Negative ROI Alerts (orange border)
- Channel name
- Current ROI vs threshold  
- Revenue
- Cost

Recommendations Box (blue):
- Optimize message content
- Check timing/frequency
- Analyze segmentation
- Adjust discount strategies
- [View Full Analytics] button

Footer: Configuration link
```

## Alert Types

### 1. Conversion Drop Alert
**Triggered when:** Channel conversion rate < threshold
**Example:**
```
📉 Low Conversion Rate: Email
Current Rate: 3.2%
Threshold: 5.0%
Messages Sent: 1,000
Conversions: 32
```

### 2. Negative/Low ROI Alert
**Triggered when:** Channel ROI < threshold
**Example:**
```
💰 Negative ROI: SMS
Current ROI: -15.8%
Threshold: 0%
Revenue: $421.00
Cost: $487.50
```

## Testing & Verification

### Manual Test
1. Go to `/admin/recovery-alert-settings`
2. Click "Test Alert Now"
3. Check configured email inbox
4. Verify alert format and data

### Simulate Low Performance
```sql
-- Temporarily lower thresholds to trigger alerts
UPDATE recovery_alert_settings
SET 
  email_conversion_threshold = 100,
  overall_roi_threshold = 1000
WHERE enabled = true;

-- Run check (via test button or cron)
-- Reset thresholds after testing
```

### Verify Cooldown
```sql
-- Check recent alerts
SELECT * FROM recovery_alert_history
WHERE admin_email = 'your-email@example.com'
ORDER BY sent_at DESC
LIMIT 10;

-- Should not send duplicate within cooldown period
```

## Monitoring Alert System

### View Alert History
```sql
SELECT 
  alert_type,
  channel,
  metric_value,
  threshold_value,
  sent_at
FROM recovery_alert_history
WHERE admin_email = 'your-email@example.com'
ORDER BY sent_at DESC;
```

### Alert Frequency Analysis
```sql
SELECT 
  alert_type,
  channel,
  COUNT(*) as alert_count,
  MIN(sent_at) as first_alert,
  MAX(sent_at) as last_alert
FROM recovery_alert_history
WHERE sent_at >= NOW() - INTERVAL '30 days'
GROUP BY alert_type, channel
ORDER BY alert_count DESC;
```

### Alert Response Time
```sql
-- Check time between alert and performance recovery
WITH alerts AS (
  SELECT 
    id,
    channel,
    sent_at,
    LEAD(sent_at) OVER (PARTITION BY channel ORDER BY sent_at) as next_alert
  FROM recovery_alert_history
  WHERE alert_type = 'conversion_drop'
)
SELECT 
  channel,
  AVG(EXTRACT(EPOCH FROM (next_alert - sent_at))/3600) as avg_hours_to_recovery
FROM alerts
WHERE next_alert IS NOT NULL
GROUP BY channel;
```

## Threshold Tuning

### Recommended Approach

1. **Start Conservative** (Week 1)
   - Use default thresholds
   - Monitor alert frequency
   - Note false positives

2. **Analyze Baseline** (Week 2)
   ```sql
   -- Get 7-day averages
   SELECT 
     'email' as channel,
     AVG(conversion_rate) as avg_conv,
     AVG(roi) as avg_roi
   FROM [your email metrics view]
   WHERE date >= CURRENT_DATE - 7;
   ```

3. **Adjust Thresholds** (Week 3)
   - Set thresholds 20-30% below baseline
   - Example: 7% baseline → 5% threshold

4. **Fine-tune** (Ongoing)
   - Weekly review of alert history
   - Adjust for seasonal variations
   - Account for campaign types

### Channel-Specific Guidelines

**Email:**
- Low cost, high volume
- More tolerant of lower conversion
- Focus on ROI over conversion rate

**SMS:**
- Higher cost per message
- Expect higher conversion
- ROI threshold more critical

**WhatsApp:**
- Best engagement rates
- Highest conversion expected
- Set aggressive thresholds

## Troubleshooting

### No Alerts Received

1. **Check Settings**
   ```sql
   SELECT * FROM recovery_alert_settings WHERE enabled = true;
   ```

2. **Verify Email**
   - Correct admin_email?
   - Check spam folder
   - Verify Resend domain

3. **Check Thresholds**
   - Are current metrics below thresholds?
   - View current performance in dashboard

4. **Verify Cron**
   ```sql
   SELECT * FROM cron.job WHERE jobname LIKE '%recovery%';
   ```

### Too Many Alerts

1. **Increase Cooldown**
   - Raise alert_cooldown_hours
   - Recommended: 12-24 hours

2. **Adjust Thresholds**
   - Lower expectations
   - Account for normal variation

3. **Review Alert History**
   ```sql
   -- Alerts by day
   SELECT 
     DATE(sent_at) as alert_date,
     COUNT(*) as alert_count
   FROM recovery_alert_history
   GROUP BY DATE(sent_at)
   ORDER BY alert_date DESC;
   ```

### Missing Data

1. **Check Recovery System**
   - Verify abandonment tracking
   - Confirm cron job running
   - Check last processed time

2. **Verify Database**
   ```sql
   SELECT COUNT(*) FROM checkout_abandonment_emails
   WHERE sent_at >= NOW() - INTERVAL '24 hours';
   ```

## Best Practices

### 1. Regular Reviews
- Weekly: Review alert history
- Monthly: Adjust thresholds based on trends
- Quarterly: Analyze ROI vs cost changes

### 2. Multiple Recipients
```sql
-- Add multiple alert configs for team
INSERT INTO recovery_alert_settings (admin_email, enabled, ...)
VALUES 
  ('manager@company.com', true, ...),
  ('team-lead@company.com', true, ...);
```

### 3. Threshold Strategy
- **Conversion**: Set 30% below your average
- **ROI**: Start at 0%, increase to 50% as you optimize
- **Cooldown**: Balance responsiveness vs noise

### 4. Alert Triage
- **Critical**: Negative ROI, immediate action
- **Warning**: Low conversion, review within 24h
- **Info**: Historical trends, weekly review

### 5. Documentation
- Document threshold changes
- Note campaign impacts
- Track resolution actions

## Integration with Recovery Analytics

The alert system works seamlessly with `/admin/recovery-analytics`:

1. **Alert Email**: Includes direct link to analytics
2. **Context**: Alerts reference last 24h, dashboard shows same period
3. **Deep Dive**: Use dashboard to investigate alert causes
4. **Validation**: Confirm metrics match between alert and dashboard

## Cost Considerations

### Email Alerts
- Resend: First 100/month free, then $0.01 each
- Estimated: ~$3-5/month for active monitoring

### Recommendations
- Use cooldown to limit alert frequency
- Consider daily digest vs instant alerts
- Monitor alert history to optimize costs

## Security Notes

1. **RLS Policies**: Admin-only access enforced
2. **Email Privacy**: Alert emails contain metrics only, no PII
3. **API Keys**: Secured in Supabase secrets
4. **Audit Trail**: All alerts logged with timestamps

## Future Enhancements

Consider implementing:
- Slack/Discord webhooks
- SMS alerts for critical issues
- Predictive alerts based on trends
- Custom alert templates
- Multi-language support
- Alert escalation rules
- Performance forecasting

## Support Resources

- **Dashboard**: `/admin/recovery-analytics`
- **Settings**: `/admin/recovery-alert-settings`
- **History Query**: See "Monitoring Alert System" section
- **Logs**: Check Supabase Edge Function logs for `check-recovery-alerts`
