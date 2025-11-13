# A/B Testing Setup Guide

## Overview

The A/B Testing feature allows you to test different email variations (subject lines, content) to determine which performs best before sending to your entire subscriber list.

## How It Works

1. **Create Test**: Define multiple variants (A, B, C, etc.) with different subjects/content
2. **Send Test**: Automatically sends each variant to a small percentage of subscribers
3. **Analyze Results**: System tracks open rates, click rates, and calculates performance scores
4. **Select Winner**: AI-powered scoring selects the best-performing variant
5. **Send Winner**: Automatically sends the winning variant to remaining subscribers

## Database Schema

### Tables Created

- **ab_tests**: Stores test configurations and status
- **ab_test_variants**: Stores email variations for each test
- **ab_test_results**: Tracks performance metrics for each variant

## Edge Functions

### 1. send-ab-test
Sends test variants to a sample of subscribers.

**URL**: `https://gfmhhnynyxvmekhvytgg.supabase.co/functions/v1/send-ab-test`

**Body**:
```json
{
  "testId": "uuid-of-test"
}
```

### 2. select-ab-winner
Analyzes results and selects the winning variant based on performance score.

**Scoring Formula**: 
```
Score = (Open Rate × 0.6) + (Click Rate × 0.4)
```

**URL**: `https://gfmhhnynyxvmekhvytgg.supabase.co/functions/v1/select-ab-winner`

**Body**:
```json
{
  "testId": "uuid-of-test"
}
```

### 3. send-ab-winner
Sends the winning variant to all remaining subscribers.

**URL**: `https://gfmhhnynyxvmekhvytgg.supabase.co/functions/v1/send-ab-winner`

**Body**:
```json
{
  "testId": "uuid-of-test"
}
```

## Using the A/B Test Manager

### Accessing the Manager

1. Sign in as an admin
2. Navigate to **Account → A/B Tests** in the navbar
3. Or visit `/admin/ab-tests` directly

### Creating an A/B Test

1. Click **"Create A/B Test"**
2. Fill in test details:
   - **Test Name**: Descriptive name (e.g., "Subject Line Test - Career Tips")
   - **Campaign Type**: Select career_tips, job_alerts, or course_updates
   - **Test Percentage**: Set 1-50% (default 20%)
   - This determines what % of subscribers receive the test
3. Configure variants (minimum 2 required):
   - **Subject**: Email subject line
   - **Preview Text**: Optional preview text
   - **HTML Content**: Full email HTML
4. Click **"Add Variant"** to add more variations (A, B, C, etc.)
5. Click **"Create Test"**

### Running a Test

1. Find your test in the "All Tests" tab
2. Click **"Send Test"** for tests in "draft" status
3. System will:
   - Randomly split test percentage of subscribers
   - Send each variant to equal groups
   - Record initial metrics in database

### Analyzing Results

1. After sending, click **"View Results"** on the test
2. Switch to **"Results & Analytics"** tab
3. View metrics for each variant:
   - Sent Count
   - Open Count & Rate
   - Click Count & Rate
   - Performance Score

### Selecting the Winner

**Manual Selection**:
1. Click **"Select Winner"** on a running test
2. System analyzes results and picks best performer
3. Test status changes to "completed"

**Automated Selection** (Optional):
Set up a cron job to auto-select winners after 24 hours:

```sql
SELECT cron.schedule(
  'auto-select-ab-winners',
  '0 9 * * *', -- Daily at 9 AM
  $$
  SELECT
    net.http_post(
        url:='https://gfmhhnynyxvmekhvytgg.supabase.co/functions/v1/select-ab-winner',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb,
        body:=concat('{"testId": "', id, '"}')::jsonb
    )
  FROM ab_tests
  WHERE status = 'running'
    AND started_at < now() - interval '24 hours';
  $$
);
```

### Sending the Winner

1. Once winner is selected, click **"Send Winner"**
2. System sends winning variant to all remaining subscribers
3. Campaign is recorded in email_campaigns table
4. Test status changes to "sent"

## Performance Scoring

The system uses a weighted scoring algorithm:

- **60% weight** on open rate (engagement indicator)
- **40% weight** on click rate (action indicator)

Higher scores indicate better overall performance.

## Best Practices

### Test Design

1. **Test One Variable**: Only change subject line OR content, not both
2. **Sufficient Sample**: Use at least 20% for reliable results
3. **Clear Variants**: Make variations distinct enough to measure
4. **Timing**: Send tests during consistent times for fair comparison

### Sample Size Guidelines

| Total Subscribers | Recommended Test % | Min Recipients per Variant |
|------------------|-------------------|---------------------------|
| < 500 | 40-50% | 100+ |
| 500-2,000 | 30-40% | 150+ |
| 2,000-10,000 | 20-30% | 200+ |
| 10,000+ | 10-20% | 500+ |

### Wait Times

- **Minimum**: 6 hours (basic open rate data)
- **Recommended**: 24 hours (full engagement data)
- **Maximum**: 48 hours (diminishing returns)

### Content Variations to Test

**Subject Lines**:
- Question vs statement
- Emoji vs no emoji
- Personal vs general
- Benefit-focused vs curiosity-driven

**Content**:
- Long-form vs short-form
- Text-heavy vs image-heavy
- Single CTA vs multiple CTAs
- Formal vs casual tone

## Troubleshooting

### Test Not Sending

1. Check test status is "draft"
2. Verify at least 2 variants exist
3. Ensure BREVO_API_KEY is configured
4. Check active subscriber count > 0

### No Results Showing

1. Verify test has been sent (status = "running")
2. Check Brevo dashboard for delivery confirmation
3. Allow time for opens/clicks to register
4. Check edge function logs for errors

### Winner Selection Fails

1. Ensure test status is "running"
2. Verify results exist in ab_test_results table
3. Check that sent_count > 0 for all variants
4. Review select-ab-winner function logs

### Winner Won't Send

1. Confirm test status is "completed"
2. Verify winner_variant_id is set
3. Check remaining subscribers count
4. Ensure BREVO_API_KEY is valid

## Monitoring

### View Edge Function Logs

Access logs through Lovable Cloud backend viewer or Supabase dashboard.

### Key Metrics to Track

- **Test Send Rate**: Success rate of test sends
- **Response Time**: How long until results are actionable
- **Winner Accuracy**: Whether winners perform well on full send
- **Subscriber Engagement**: Overall impact on list health

## Integration with Campaign Manager

A/B tests work alongside regular campaigns:

- Regular campaigns: Pre-scheduled content sent to all
- A/B tests: Testing phase + winner deployment

Both are recorded in the `email_campaigns` table for unified reporting.

## Security

All A/B test tables have RLS policies requiring admin role:
- Only admins can create/view/modify tests
- Edge functions use service role for data access
- Test sends are logged for audit trail

## Future Enhancements

Potential features to consider:

1. **Multi-variate Testing**: Test multiple variables simultaneously
2. **Automatic Winner Deployment**: Auto-send after threshold met
3. **Historical Insights**: Learn from past test patterns
4. **Segment Testing**: Test on specific subscriber segments
5. **Template Library**: Save winning templates for reuse

## Support

For issues or questions:
1. Check edge function logs in backend
2. Verify database records in relevant tables
3. Review this documentation for setup steps
4. Contact system administrator if issues persist
