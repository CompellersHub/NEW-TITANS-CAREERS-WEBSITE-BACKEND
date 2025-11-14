# Alert Analytics Dashboard Guide

Comprehensive guide for tracking alert volume, response times, resolution tracking, and team performance metrics for your recovery alert system.

## Overview

The Alert Analytics Dashboard (`/admin/alert-analytics`) provides deep insights into how your team handles recovery alerts, tracks performance metrics, and identifies bottlenecks in the alert response process.

## Dashboard Features

### 1. Key Performance Indicators (KPIs)

Four critical metrics displayed at the top:

#### Total Alerts
- **Description**: Total number of alerts triggered across all time
- **Submetric**: Alerts in last 30 days
- **Purpose**: Understand overall alert volume and trends

#### Average Response Time
- **Description**: Average time from alert sent to acknowledgment
- **Unit**: Hours
- **Purpose**: Track how quickly team responds to alerts
- **Benchmark**: < 2 hours for critical alerts

#### Average Resolution Time
- **Description**: Average time from alert sent to resolution
- **Unit**: Hours
- **Purpose**: Measure how long it takes to fix issues
- **Benchmark**: < 24 hours for most alerts

#### Resolution Rate
- **Description**: Percentage of alerts that have been resolved
- **Purpose**: Track team effectiveness in closing alerts
- **Target**: > 90% resolution rate

### 2. Volume Trends Tab

**30-Day Alert Volume Chart**
- Line chart showing daily alert count
- Helps identify patterns and spikes
- Use to correlate with marketing campaigns or system changes

**Insights to look for:**
- 📈 **Increasing trends**: May indicate declining campaign performance
- 📊 **Spikes**: Investigate what happened on that day
- 📉 **Decreasing trends**: Sign of improvement or fewer campaigns

### 3. Distribution Tab

Three pie charts showing alert breakdown:

#### Channel Distribution
Shows which channels trigger most alerts:
- **Email** (Blue 📧)
- **SMS** (Purple 📱)
- **WhatsApp** (Green 💬)
- **Overall** (Orange 📊)

**Action items:**
- Channels with high alert volume may need optimization
- Consider pausing underperforming channels
- Investigate why certain channels trigger more alerts

#### Alert Type Distribution
Breaks down alerts by issue type:
- **Conversion Rate** (Orange) - Conversion drops below threshold
- **Negative ROI** (Red) - Campaign losing money

**Action items:**
- High conversion rate alerts → Review messaging, targeting
- High ROI alerts → Urgent - pause campaigns immediately

#### Status Distribution
Shows current state of all alerts:
- **Pending** (Red) - Not yet acknowledged
- **Acknowledged** (Orange) - Team member aware, investigating
- **Resolved** (Green) - Issue fixed
- **Ignored** (Gray) - Alert dismissed as non-issue

**Action items:**
- High pending count → Team may be overwhelmed
- Low resolution rate → Need better processes
- Many ignored alerts → Thresholds may be too sensitive

### 4. Alert List Tab

**Recent Alerts (Last 20)**
- Chronological list of alerts
- Each alert shows:
  - Channel icon and name
  - Status badge
  - Alert type and metric values
  - Timestamp
  - Resolution notes (if resolved)

**Available Actions:**

For **Pending** alerts:
- `Acknowledge` - Mark as seen, investigating
- `Resolve` - Mark as fixed (requires notes)

For **Acknowledged** alerts:
- `Resolve` - Mark as fixed (requires notes)

## Alert Workflow

### Recommended Response Process

1. **Alert Triggered**
   - Alert sent via Email & Slack
   - Status: `Pending`
   - Timer starts for response time tracking

2. **Team Member Acknowledges**
   - Click "Acknowledge" button
   - Status: `Acknowledged`
   - Response time recorded
   - Indicates someone is working on it

3. **Investigation & Action**
   - Team member reviews metrics
   - Adjusts campaigns, targeting, or messaging
   - Documents actions taken

4. **Resolution**
   - Click "Resolve" button
   - Add resolution notes (required)
   - Status: `Resolved`
   - Resolution time recorded

### Resolution Notes Best Practices

Good resolution notes should include:
- **What was wrong**: Brief problem description
- **Action taken**: What you did to fix it
- **Result**: Expected outcome or verification

**Example good notes:**
```
Conversion rate dropped due to outdated email subject line.
Updated subject to be more compelling and personalized.
Testing new variant - expecting 2% lift.
```

**Example poor notes:**
```
Fixed it
```

### When to Ignore Alerts

Use "Ignore" status sparingly, only when:
- Alert was triggered by temporary data anomaly
- Threshold was set too conservatively
- Issue resolved itself before team could act
- Alert was duplicate of another alert

Always add notes explaining why ignored.

## Performance Metrics Explained

### Response Time

**Definition**: Time from alert sent to first acknowledgment

**Formula**: 
```
Response Time = acknowledged_at - sent_at
```

**Interpretation:**
- < 1 hour: Excellent (24/7 monitoring)
- 1-4 hours: Good (business hours response)
- 4-8 hours: Fair (next-day response)
- > 8 hours: Poor (alerts being missed)

**Improving Response Time:**
- Enable Slack alerts for instant notifications
- Assign on-call rotations
- Set up mobile push notifications
- Create escalation policies

### Resolution Time

**Definition**: Time from alert sent to resolution marked

**Formula**: 
```
Resolution Time = resolved_at - sent_at
```

**Interpretation:**
- < 2 hours: Excellent (immediate fix)
- 2-8 hours: Good (same-day resolution)
- 8-24 hours: Fair (next-day resolution)
- > 24 hours: Poor (delayed response)

**Improving Resolution Time:**
- Document common fixes in playbooks
- Automate simple corrections
- Pre-approve emergency campaign pauses
- Train team on quick diagnostic tools

### Resolution Rate

**Definition**: Percentage of all alerts that are resolved

**Formula**: 
```
Resolution Rate = (resolved_alerts / total_alerts) × 100
```

**Interpretation:**
- > 95%: Excellent (nearly all issues fixed)
- 85-95%: Good (most issues addressed)
- 70-85%: Fair (room for improvement)
- < 70%: Poor (many unresolved alerts)

**Improving Resolution Rate:**
- Set team goals for closing alerts
- Review old pending alerts weekly
- Investigate patterns in unresolved alerts
- Consider if thresholds need adjustment

## Team Performance Tracking

### Individual Metrics (Future Feature)

Track per-admin:
- Alerts acknowledged
- Alerts resolved
- Average response time
- Average resolution time
- Resolution quality (based on notes)

### Team Benchmarks

Set team-wide goals:
- **Response Time Target**: < 2 hours
- **Resolution Time Target**: < 12 hours
- **Resolution Rate Target**: > 90%
- **Pending Alert Limit**: < 5 at any time

### Performance Reviews

Use analytics for:
- Monthly team performance reviews
- Identifying training needs
- Recognizing top performers
- Improving processes

## SQL Queries for Advanced Analysis

### Alerts by Hour of Day
```sql
SELECT 
  EXTRACT(HOUR FROM sent_at) as hour,
  COUNT(*) as alert_count
FROM recovery_alert_history
WHERE sent_at >= NOW() - INTERVAL '30 days'
GROUP BY hour
ORDER BY hour;
```

### Slowest Responses
```sql
SELECT 
  id,
  channel,
  alert_type,
  sent_at,
  acknowledged_at,
  EXTRACT(EPOCH FROM (acknowledged_at - sent_at)) / 3600 as response_hours
FROM recovery_alert_history
WHERE acknowledged_at IS NOT NULL
ORDER BY response_hours DESC
LIMIT 10;
```

### Most Common Alert Patterns
```sql
SELECT 
  channel,
  alert_type,
  COUNT(*) as count,
  AVG(metric_value) as avg_metric,
  AVG(threshold_value) as avg_threshold
FROM recovery_alert_history
WHERE sent_at >= NOW() - INTERVAL '30 days'
GROUP BY channel, alert_type
ORDER BY count DESC;
```

### Team Member Performance
```sql
SELECT 
  acknowledged_by,
  COUNT(*) as alerts_handled,
  AVG(EXTRACT(EPOCH FROM (acknowledged_at - sent_at)) / 3600) as avg_response_hours,
  AVG(EXTRACT(EPOCH FROM (resolved_at - sent_at)) / 3600) as avg_resolution_hours,
  COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_count
FROM recovery_alert_history
WHERE acknowledged_by IS NOT NULL
GROUP BY acknowledged_by
ORDER BY alerts_handled DESC;
```

### Alert Resolution Effectiveness
```sql
WITH alert_metrics AS (
  SELECT 
    id,
    channel,
    alert_type,
    sent_at,
    resolved_at,
    EXTRACT(EPOCH FROM (resolved_at - sent_at)) / 3600 as resolution_hours
  FROM recovery_alert_history
  WHERE status = 'resolved'
)
SELECT 
  channel,
  COUNT(*) as resolved_count,
  AVG(resolution_hours) as avg_resolution_hours,
  MIN(resolution_hours) as fastest_resolution,
  MAX(resolution_hours) as slowest_resolution
FROM alert_metrics
GROUP BY channel
ORDER BY avg_resolution_hours;
```

## Integration with Slack

### Alert Workflow with Slack

1. **Alert Sent to Slack**
   - Alert appears in designated channel
   - Team members see it instantly

2. **Acknowledge in Slack**
   - React with 👀 emoji to acknowledge
   - Or click "Acknowledge" in dashboard

3. **Discuss in Thread**
   - Use Slack threads for collaboration
   - Document investigation in thread

4. **Mark Resolved**
   - Copy resolution notes from thread
   - Paste into dashboard when resolving
   - React with ✅ when done

### Slack Workflow Automation (Future)

Planned features:
- React with 👀 in Slack = auto-acknowledge
- React with ✅ in Slack = auto-resolve
- Slash commands: `/alert-stats`, `/alert-resolve`
- Automated status updates in threads

## Best Practices

### For Team Leads

1. **Daily Reviews**
   - Check pending alerts each morning
   - Follow up on old acknowledged alerts
   - Review resolution notes for quality

2. **Weekly Analysis**
   - Review 7-day trends
   - Identify recurring issues
   - Adjust thresholds if needed

3. **Monthly Reports**
   - Present metrics to stakeholders
   - Set goals for next month
   - Celebrate improvements

### For Team Members

1. **Immediate Actions**
   - Acknowledge alerts within 1 hour
   - Investigate thoroughly
   - Document all actions

2. **Clear Communication**
   - Write detailed resolution notes
   - Update status promptly
   - Ask for help if stuck

3. **Proactive Monitoring**
   - Check dashboard daily
   - Review trends
   - Suggest improvements

### For System Optimization

1. **Threshold Tuning**
   - If too many ignored alerts → raise thresholds
   - If missing real issues → lower thresholds
   - Review monthly and adjust

2. **Alert Consolidation**
   - Multiple alerts for same issue? → Add cooldown
   - Related alerts → Combine into single notification
   - False positives → Improve detection logic

3. **Process Improvements**
   - Document common fixes
   - Create playbooks
   - Automate repetitive tasks

## Troubleshooting

### No Alerts Showing

**Check:**
1. Are alerts being triggered? (See Alert Settings)
2. Do you have admin role?
3. Check recovery_alert_history table directly

**Query:**
```sql
SELECT COUNT(*) FROM recovery_alert_history;
```

### Metrics Not Calculating

**Common Issues:**
- Timestamps missing (acknowledged_at, resolved_at)
- Status not updated properly
- Old data without new columns

**Fix:**
```sql
-- Check for null values
SELECT 
  COUNT(*) as total,
  COUNT(acknowledged_at) as has_ack,
  COUNT(resolved_at) as has_resolved
FROM recovery_alert_history;
```

### Can't Update Alert Status

**Check:**
1. Do you have admin role?
2. Is RLS policy applied?
3. Browser console for errors

**Verify Policy:**
```sql
SELECT * FROM pg_policies 
WHERE tablename = 'recovery_alert_history';
```

## API Reference

### Update Alert Status

```typescript
// Acknowledge alert
await supabase
  .from('recovery_alert_history')
  .update({
    acknowledged_at: new Date().toISOString(),
    acknowledged_by: userId,
    status: 'acknowledged'
  })
  .eq('id', alertId);

// Resolve alert
await supabase
  .from('recovery_alert_history')
  .update({
    resolved_at: new Date().toISOString(),
    resolved_by: userId,
    status: 'resolved',
    resolution_notes: 'Fixed by updating email subject line'
  })
  .eq('id', alertId);

// Ignore alert
await supabase
  .from('recovery_alert_history')
  .update({
    status: 'ignored',
    resolution_notes: 'False positive - temporary data anomaly'
  })
  .eq('id', alertId);
```

### Query Alert Analytics

```typescript
// Get alerts with response times
const { data } = await supabase
  .from('recovery_alert_history')
  .select('*')
  .order('sent_at', { ascending: false });

// Calculate metrics
const avgResponseTime = data
  .filter(a => a.acknowledged_at)
  .reduce((sum, a) => {
    const diff = new Date(a.acknowledged_at).getTime() - 
                 new Date(a.sent_at).getTime();
    return sum + diff;
  }, 0) / data.length;
```

## Future Enhancements

Planned features for the dashboard:

### 1. Predictive Analytics
- Forecast alert volume based on historical data
- Predict which campaigns will trigger alerts
- Alert before thresholds are breached

### 2. Alert Correlation
- Identify patterns across channels
- Link related alerts automatically
- Suggest root cause analysis

### 3. Team Leaderboards
- Gamify alert resolution
- Recognize top performers
- Encourage healthy competition

### 4. Automated Responses
- Auto-pause campaigns with negative ROI
- Trigger A/B tests when conversions drop
- Send alerts to campaign owners directly

### 5. Mobile App
- Receive push notifications
- Acknowledge/resolve from phone
- View key metrics on-the-go

### 6. Integration Expansion
- Microsoft Teams support
- PagerDuty integration
- Webhook for custom integrations

## Support & Resources

- **Dashboard**: `/admin/alert-analytics`
- **Alert Settings**: `/admin/recovery-alert-settings`
- **Recovery Analytics**: `/admin/recovery-analytics`
- **Alert History Table**: `recovery_alert_history`
- **Slack Setup**: See `SLACK_ALERTS_SETUP.md`

## Key Takeaways

✅ **Response Time** matters - faster response = better outcomes
✅ **Resolution Notes** are crucial - document everything
✅ **Status Updates** keep team aligned - update promptly
✅ **Trend Analysis** reveals patterns - review weekly
✅ **Team Performance** drives improvement - set goals and track
