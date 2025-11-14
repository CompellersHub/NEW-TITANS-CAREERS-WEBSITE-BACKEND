# Slack Alerts Integration Setup Guide

This guide explains how to set up Slack webhook integration for instant recovery alerts, sending real-time performance notifications to your team channel.

## Overview

The Slack integration sends instant alerts to your team's Slack channel when:
- Conversion rates drop below configured thresholds
- ROI becomes negative or falls below thresholds
- Performance metrics require immediate attention

## Slack Workspace Setup

### Step 1: Create an Incoming Webhook

1. **Go to Slack App Directory**
   - Visit: https://api.slack.com/messaging/webhooks
   - Click "Create New App" or use existing app

2. **Enable Incoming Webhooks**
   - In your app settings, enable "Incoming Webhooks"
   - Click "Add New Webhook to Workspace"

3. **Choose a Channel**
   - Select the channel where alerts should be posted
   - Common choices: `#alerts`, `#recovery-performance`, `#marketing-alerts`
   - Click "Allow"

4. **Copy Webhook URL**
   - You'll receive a URL like: `https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX`
   - Keep this URL secure - it provides access to post in your channel

### Step 2: Configure in Recovery Alert Settings

1. Navigate to `/admin/recovery-alert-settings`
2. Scroll to "Slack Integration" section
3. Toggle "Enable Slack Alerts" to ON
4. Paste your webhook URL in the "Slack Webhook URL" field
5. Click "Save Settings"

## Alert Message Format

### Conversion Rate Alerts

```
🚨 Conversion Rate Alert: Email 📧
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Email conversion rate has dropped to 3.45% (threshold: 5.00%)

Channel: Email
Current Value: 3.45%
Threshold: 5.00%
Action Required: Review messaging, targeting, or timing

Recovery Alerts System • Just now
```

### ROI Alerts

```
💰 Negative ROI Alert: SMS 📱
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SMS ROI is -12.34% (losing money!)

Channel: SMS
Current Value: -12.34%
Threshold: 0.00%
Action Required: Pause campaign or adjust strategy

Recovery Alerts System • Just now
```

## Color Coding

Slack messages use color-coded attachments for quick visual assessment:

| Color | Meaning | When Used |
|-------|---------|-----------|
| 🔴 Red (#FF0000) | Critical | Value < 50% of threshold OR negative ROI |
| 🟠 Orange (#FFA500) | Warning | Value < 75% of threshold |
| 🟡 Yellow (#FFFF00) | Caution | Value < threshold but > 75% |

## Channel Emojis

Each channel type has a unique emoji for quick identification:

- **Email**: 📧
- **SMS**: 📱
- **WhatsApp**: 💬
- **Overall**: 📊

## Testing Slack Alerts

### Test via UI

1. Go to `/admin/recovery-alert-settings`
2. Ensure Slack is enabled with valid webhook URL
3. Click "Test Alert Now" button
4. Check your Slack channel for the test alert

### Manual Test with curl

```bash
curl -X POST "https://your-project.supabase.co/functions/v1/check-recovery-alerts" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"
```

### Validate Webhook

Test your webhook directly:

```bash
curl -X POST https://hooks.slack.com/services/YOUR/WEBHOOK/URL \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Test alert from Recovery System",
    "attachments": [{
      "color": "#FF0000",
      "title": "Test Alert",
      "text": "This is a test message"
    }]
  }'
```

## Alert Frequency & Cooldown

Slack alerts respect the same cooldown settings as email alerts:

- **Default Cooldown**: 6 hours
- **Purpose**: Prevent alert fatigue
- **Per Channel**: Each channel (Email, SMS, WhatsApp) has independent cooldown
- **Configuration**: Adjustable in Recovery Alert Settings

## Best Practices

### 1. Channel Selection

Choose the right Slack channel:
- ✅ **Dedicated alerts channel**: `#recovery-alerts`, `#marketing-performance`
- ✅ **Team channel**: `#marketing-team`, `#growth-team`
- ❌ **Avoid**: `#general`, `#random` (too noisy)

### 2. Webhook Security

- Never commit webhook URLs to version control
- Rotate webhooks if accidentally exposed
- Use separate webhooks for staging/production

### 3. Alert Management

- Set appropriate thresholds to avoid alert fatigue
- Use cooldown periods to batch related issues
- Monitor Slack channel for response times

### 4. Team Workflow

**Recommended response workflow:**
1. Alert appears in Slack
2. Team member reacts with 👀 (acknowledging)
3. Investigation begins
4. React with ✅ when resolved
5. Thread discussion for context

### 5. Alert Routing

Consider using multiple webhooks for different severity:
- Critical alerts → `#alerts-critical`
- Performance warnings → `#alerts-performance`
- Daily summaries → `#analytics-daily`

## Slack App Permissions

Your incoming webhook needs these permissions:
- `incoming-webhook` - Required for posting messages
- `chat:write` - Allows posting to channel

No additional permissions needed for basic alerts.

## Troubleshooting

### Alerts Not Appearing in Slack

**Check webhook URL:**
```sql
SELECT slack_webhook_url, slack_enabled 
FROM recovery_alert_settings 
WHERE enabled = true;
```

**Verify webhook is valid:**
- Should start with `https://hooks.slack.com/services/`
- Should have three segments: T-ID/B-ID/TOKEN
- Test with curl command above

**Check edge function logs:**
```bash
# In your Lovable Cloud backend
# Navigate to Edge Functions → check-recovery-alerts → Logs
# Look for "Slack alert sent" or error messages
```

### Webhook Returns 404

- Webhook may have been deleted in Slack
- Create a new incoming webhook
- Update the URL in recovery settings

### Webhook Returns 403

- App may have been removed from workspace
- Re-install the incoming webhook app
- Generate new webhook URL

### Messages Format Incorrectly

- Ensure webhook URL is complete
- Check for special characters in channel name
- Verify JSON payload format in edge function

### Rate Limiting

Slack webhooks have rate limits:
- **1 message per second** per webhook
- Solution: Use cooldown settings effectively
- Avoid rapid-fire testing

## Advanced Configuration

### Custom Slack App

For more advanced features (threading, buttons, etc.), create a custom Slack app:

1. **Create Custom App**
   - Go to https://api.slack.com/apps
   - Click "Create New App" → "From scratch"
   - Name it "Recovery Alerts"

2. **Configure OAuth Scopes**
   - Add `chat:write` scope
   - Add `channels:read` for channel listing

3. **Install to Workspace**
   - Install app to your workspace
   - Save the Bot Token

4. **Update Edge Function**
   - Replace webhook with Bot Token
   - Use Slack Web API instead of webhook
   - Enable threading, reactions, and buttons

### Slack Blocks API

Upgrade from attachments to Blocks API for richer formatting:

```typescript
const slackPayload = {
  blocks: [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: "🚨 Conversion Rate Alert",
        emoji: true
      }
    },
    {
      type: "section",
      fields: [
        {
          type: "mrkdwn",
          text: "*Channel:*\nEmail 📧"
        },
        {
          type: "mrkdwn",
          text: "*Current:*\n3.45%"
        }
      ]
    },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "View Dashboard"
          },
          url: "https://your-app.com/admin/recovery-analytics"
        }
      ]
    }
  ]
};
```

## Integration with Other Tools

### Connect to PagerDuty

Route critical alerts to PagerDuty via Slack integration:
1. Install PagerDuty app in Slack
2. Use `/pd` commands in alert channel
3. Auto-create incidents from alerts

### Connect to Jira

Create tickets automatically:
1. Install Jira app in Slack
2. Use `/jira create` in alert threads
3. Track resolution in Jira

### Connect to Datadog

Send metrics to Datadog:
1. Configure Datadog Slack integration
2. Parse alert messages for metrics
3. Create custom dashboards

## Monitoring Slack Integration

### Key Metrics to Track

1. **Alert Volume**: How many alerts sent per day
2. **Response Time**: Time from alert to first reaction
3. **Resolution Time**: Time from alert to resolved
4. **False Positives**: Alerts that didn't require action

### Query Alert History

```sql
SELECT 
  alert_type,
  channel,
  COUNT(*) as alert_count,
  AVG(metric_value) as avg_metric_value
FROM recovery_alert_history
WHERE sent_at >= NOW() - INTERVAL '30 days'
GROUP BY alert_type, channel
ORDER BY alert_count DESC;
```

## Cost Considerations

Slack webhook usage is **FREE** with:
- Unlimited messages
- Unlimited apps
- All features available

However, consider:
- **Rate limits**: 1 message/second per webhook
- **Message history**: Free workspaces have limited history
- **App limits**: Free workspaces can have 10 apps

## Security Best Practices

1. **Webhook URL Protection**
   - Store in database, never in code
   - Use environment variables for secrets
   - Rotate webhooks periodically

2. **Access Control**
   - Only admins can configure webhooks
   - Use RLS policies on settings table
   - Audit webhook changes

3. **Message Content**
   - Don't include sensitive customer data
   - Use aggregated metrics only
   - Mask email addresses if needed

4. **Workspace Security**
   - Enable 2FA for Slack workspace
   - Review app permissions regularly
   - Monitor webhook usage logs

## Support & Resources

- **Slack API Docs**: https://api.slack.com/messaging/webhooks
- **Block Kit Builder**: https://api.slack.com/block-kit/building
- **Recovery Analytics**: `/admin/recovery-analytics`
- **Alert Settings**: `/admin/recovery-alert-settings`
- **Alert History**: Query `recovery_alert_history` table

## Next Steps

1. ✅ Create Slack webhook
2. ✅ Configure in Recovery Alert Settings
3. ✅ Test alerts
4. ✅ Monitor Slack channel
5. ✅ Adjust thresholds based on team feedback
6. Consider custom Slack app for advanced features
7. Set up alert response workflows
8. Train team on alert interpretation
