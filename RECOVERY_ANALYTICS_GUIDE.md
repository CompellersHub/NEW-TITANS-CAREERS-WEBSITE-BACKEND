# Recovery Analytics Dashboard Guide

Comprehensive analytics dashboard for monitoring abandoned checkout recovery performance across Email, SMS, and WhatsApp channels.

## Access

Navigate to: `/admin/recovery-analytics`

This dashboard provides real-time insights into your multi-channel recovery campaign effectiveness.

## Dashboard Sections

### 1. Overall Performance Metrics

Four key performance indicators displayed at the top:

**Messages Sent**
- Total number of recovery messages sent across all channels
- Includes email, SMS, and WhatsApp combined
- Badge shows overall message count

**Conversions**
- Total number of customers who completed purchase after recovery message
- Percentage badge shows overall conversion rate
- Green indicator for positive performance

**Total Recovered**
- Revenue generated from recovered abandoned checkouts
- Shows actual course enrollment revenue in £
- Direct impact on bottom line

**Total Cost**
- Combined cost of all recovery messages sent
- Includes email (free), SMS (£0.038), WhatsApp (£0.03)
- ROI multiplier badge shows return on investment

### 2. Channel Performance Comparison

Side-by-side comparison of all three channels with detailed metrics:

#### Email Channel
- **Sent**: Total emails sent
- **Engaged**: Number of emails opened (engagement rate %)
- **Converted**: Customers who purchased after email
- **Cost**: £0 (free on Brevo free tier - 300/day)
- **Revenue**: Total sales from email conversions
- **ROI**: Infinite (no cost) or calculated based on upgrades

#### SMS Channel
- **Sent**: Total SMS messages sent
- **Engaged**: SMS delivered successfully (delivery rate %)
- **Converted**: Customers who purchased after SMS
- **Cost**: £0.038 per SMS sent
- **Revenue**: Total sales from SMS conversions
- **ROI**: (Revenue - Cost) / Cost × 100

#### WhatsApp Channel
- **Sent**: Total WhatsApp messages sent
- **Engaged**: Messages read by recipients (read rate %)
- **Converted**: Customers who purchased after WhatsApp
- **Cost**: £0.03 per WhatsApp message
- **Revenue**: Total sales from WhatsApp conversions
- **ROI**: (Revenue - Cost) / Cost × 100

**Visual Chart**
- Bar chart showing Sent vs Engaged vs Converted for each channel
- Easy visual comparison of channel effectiveness
- Helps identify best-performing channel

### 3. Sequence Performance Analysis

Breakdown of performance by message sequence (1 hour, 24 hour, 72 hour):

#### Three Interactive Tabs

**Conversion Rates Tab**
- Line chart showing conversions by sequence step
- Separate lines for Email, SMS, WhatsApp conversions
- Helps identify which timing works best

**Engagement Tab**
- Bar chart showing engagement metrics by step
- Email opens, SMS delivered, WhatsApp reads
- Shows how engagement changes over time

**Message Volume Tab**
- Bar chart showing total messages sent by step
- Tracks campaign reach at each interval
- Identifies drop-off points in sequence

### 4. ROI Breakdown

Two pie charts providing financial insights:

**Cost-Effectiveness Chart**
- Visual breakdown of cost by channel
- Shows where marketing budget is allocated
- Helps optimize spending

**Revenue Distribution Chart**
- Shows which channel generates most revenue
- Visual representation of channel ROI
- Guides resource allocation decisions

## Key Metrics Explained

### Engagement Rate
```
Engagement Rate = (Engaged Messages / Sent Messages) × 100
```
- **Email**: % of emails opened
- **SMS**: % of SMS delivered
- **WhatsApp**: % of messages read

### Conversion Rate
```
Conversion Rate = (Conversions / Sent Messages) × 100
```
- Percentage of recipients who completed purchase
- Higher is better
- Industry average: 15-20% for multi-channel

### ROI Calculation
```
ROI = ((Revenue - Cost) / Cost) × 100
```
- Return on Investment multiplier
- Shows profitability of each channel
- Email typically shows infinite ROI (no cost)

### Cost Structure
- **Email**: £0 (300 free per day on Brevo)
- **SMS**: £0.038 per message
- **WhatsApp**: £0.03 per message
- **Average Course Price**: £500 (used for revenue calculations)

## Understanding the Data

### Best Performing Channel
Look for:
- Highest conversion rate
- Highest ROI
- Best engagement rate
- Most total conversions

### Sequence Optimization
Analyze:
- Which step converts best (1hr, 24hr, 72hr)
- Where engagement drops off
- Optimal timing for your audience

### Cost Efficiency
Compare:
- Cost per conversion by channel
- Revenue per message sent
- Overall campaign ROI

## Action Items Based on Insights

### If Email Performs Best
- Increase email frequency
- A/B test subject lines
- Enhance email design
- Add more email touchpoints

### If SMS Performs Best
- Increase SMS budget
- Test different message timing
- Optimize message content
- Consider SMS-first strategy

### If WhatsApp Performs Best
- Create more WhatsApp templates
- Add rich media messages
- Enable two-way conversations
- Focus WhatsApp growth

### If Conversions Are Low Overall
- Review discount amounts (10%, 15%)
- Test different timing intervals
- Improve message copy
- Check course pricing
- Verify tracking is working

### If Cost Is Too High
- Focus on highest ROI channel
- Reduce low-performing sequences
- Optimize send frequency
- Consider email-only for some segments

## SQL Queries for Deep Dive

### Channel Performance Details
```sql
-- Email Performance
SELECT 
  email_sequence_number,
  COUNT(*) as sent,
  SUM(CASE WHEN opened THEN 1 ELSE 0 END) as opened,
  SUM(CASE WHEN clicked THEN 1 ELSE 0 END) as clicked,
  SUM(CASE WHEN converted THEN 1 ELSE 0 END) as converted
FROM checkout_abandonment_emails
GROUP BY email_sequence_number
ORDER BY email_sequence_number;

-- SMS Performance
SELECT 
  sms_sequence_number,
  COUNT(*) as sent,
  SUM(CASE WHEN delivered THEN 1 ELSE 0 END) as delivered,
  SUM(CASE WHEN clicked THEN 1 ELSE 0 END) as clicked,
  SUM(CASE WHEN converted THEN 1 ELSE 0 END) as converted
FROM checkout_abandonment_sms
GROUP BY sms_sequence_number
ORDER BY sms_sequence_number;

-- WhatsApp Performance
SELECT 
  whatsapp_sequence_number,
  COUNT(*) as sent,
  SUM(CASE WHEN delivered THEN 1 ELSE 0 END) as delivered,
  SUM(CASE WHEN read THEN 1 ELSE 0 END) as read,
  SUM(CASE WHEN clicked THEN 1 ELSE 0 END) as clicked,
  SUM(CASE WHEN converted THEN 1 ELSE 0 END) as converted
FROM checkout_abandonment_whatsapp
GROUP BY whatsapp_sequence_number
ORDER BY whatsapp_sequence_number;
```

### Recent Activity
```sql
-- Last 7 days performance
SELECT 
  DATE(sent_at) as date,
  COUNT(DISTINCT cae.id) as emails,
  COUNT(DISTINCT cas.id) as sms,
  COUNT(DISTINCT caw.id) as whatsapp,
  SUM(CASE WHEN cae.converted THEN 1 ELSE 0 END) +
  SUM(CASE WHEN cas.converted THEN 1 ELSE 0 END) +
  SUM(CASE WHEN caw.converted THEN 1 ELSE 0 END) as conversions
FROM checkout_sessions cs
LEFT JOIN checkout_abandonment_emails cae ON cs.id = cae.checkout_session_id
LEFT JOIN checkout_abandonment_sms cas ON cs.id = cas.checkout_session_id
LEFT JOIN checkout_abandonment_whatsapp caw ON cs.id = caw.checkout_session_id
WHERE cs.created_at > NOW() - INTERVAL '7 days'
GROUP BY DATE(sent_at)
ORDER BY date DESC;
```

## Benchmarks

### Industry Standards
- **Email Open Rate**: 20-30%
- **Email Click Rate**: 2-5%
- **Email Conversion Rate**: 1-3%
- **SMS Delivery Rate**: 95-98%
- **SMS Conversion Rate**: 3-8%
- **WhatsApp Read Rate**: 90-98%
- **WhatsApp Conversion Rate**: 10-20%
- **Overall Recovery Rate**: 15-25%

### Your Goals
Set targets based on:
- Current performance
- Industry benchmarks
- Budget constraints
- Business objectives

## Troubleshooting

### No Data Showing
1. Check if abandoned checkout tracking is active
2. Verify cron job is running (`process-abandoned-checkouts`)
3. Ensure Brevo API key is configured
4. Test manual trigger of edge function

### Low Engagement
1. Check email deliverability (sender domain verified)
2. Verify SMS sender name is approved
3. Confirm WhatsApp templates are approved
4. Test messages aren't going to spam

### Low Conversions
1. Review discount codes (COMEBACK10, LASTCHANCE15)
2. Check course pricing vs market
3. Analyze message timing
4. Test different value propositions

### High Costs
1. Reduce SMS frequency if ROI is low
2. Focus on email first (free)
3. Only use WhatsApp for high-value carts
4. Implement cost caps in edge function

## Best Practices

### Regular Monitoring
- Check dashboard daily
- Review weekly trends
- Monthly deep-dive analysis
- Quarterly strategy reviews

### A/B Testing
- Test one variable at a time
- Run tests for minimum 100 sends
- Document all changes
- Implement winners gradually

### Optimization Cycle
1. Analyze current performance
2. Identify improvement opportunities
3. Implement changes
4. Monitor results
5. Repeat

### Data-Driven Decisions
- Don't guess, measure
- Use dashboard insights
- Test hypotheses
- Scale what works

## Future Enhancements

Potential additions to dashboard:
- [ ] Time-of-day performance analysis
- [ ] Course category breakdown
- [ ] Customer segment analysis
- [ ] Cohort analysis
- [ ] Predictive analytics
- [ ] Automated recommendations
- [ ] Export to PDF/Excel
- [ ] Email alerts for performance changes
- [ ] Comparison to previous periods
- [ ] Goal tracking and alerts

## Support

For issues or questions:
- Check edge function logs for errors
- Review database tables for data consistency
- Verify Brevo dashboard matches analytics
- Contact support with specific metrics questions
