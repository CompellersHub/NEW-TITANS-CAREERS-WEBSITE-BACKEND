# Subscriber Segmentation Setup Guide

## Overview

The subscriber segmentation system allows you to group newsletter subscribers based on tags, engagement scores, and other criteria. You can then target specific segments in your email campaigns and A/B tests for more personalized messaging.

## Key Features

1. **Custom Tags**: Tag subscribers with custom labels (e.g., "premium", "free-trial", "interested-in-courses")
2. **Engagement Scoring**: Automatic scoring (0-100) based on email opens and clicks
3. **Segment Creation**: Define dynamic segments using tag filters and engagement ranges
4. **Targeted Campaigns**: Send campaigns to specific segments only
5. **Real-time Counts**: See how many subscribers match each segment

## Database Schema

### New Tables

**subscriber_segments**
- Stores segment definitions with filtering rules
- Includes tag filters (include/exclude) and engagement score ranges
- Auto-calculates subscriber counts

**engagement_events**
- Tracks email opens, clicks, and unsubscribes
- Links to specific campaigns and subscribers
- Used to calculate engagement scores

### Updated Tables

**newsletter_subscribers** - Added fields:
- `tags` (text[]): Array of custom tags
- `engagement_score` (integer): Calculated score 0-100
- `total_opens` (integer): Total email opens
- `total_clicks` (integer): Total email clicks  
- `last_engagement_at` (timestamp): Last interaction time

## Engagement Scoring

### How Scores Are Calculated

The `calculate_engagement_score()` function scores subscribers 0-100:

**Formula:**
- **Opens**: Up to 40 points (2 points per open, capped at 20 opens)
- **Clicks**: Up to 60 points (6 points per click, capped at 10 clicks)
- **Inactivity Penalty**: Score halved if subscribed >90 days with no opens

**Examples:**
- 10 opens + 5 clicks = 50 points (moderate engagement)
- 20+ opens + 10+ clicks = 100 points (highly engaged)
- 0 opens + 0 clicks = 0 points (no engagement)

### Updating Scores

Scores are calculated from events in the last 90 days.

**Manual Update:**
Visit the edge function: 
```
https://gfmhhnynyxvmekhvytgg.supabase.co/functions/v1/update-engagement-scores
```

**Automated Update (Recommended):**
Set up a cron job to update daily:

```sql
SELECT cron.schedule(
  'update-engagement-scores-daily',
  '0 2 * * *', -- Daily at 2 AM
  $$
  SELECT
    net.http_post(
        url:='https://gfmhhnynyxvmekhvytgg.supabase.co/functions/v1/update-engagement-scores',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);
```

## Using the Segment Manager

### Access
Navigate to **Account → Segments** in the admin navbar or visit `/admin/segments`.

### Creating a Segment

1. Click **"Create Segment"**
2. Fill in segment details:

**Basic Info:**
- **Name**: Descriptive name (e.g., "Highly Engaged Subscribers")
- **Description**: Brief explanation of the segment

**Tag Filters:**
- **Include Tags**: Subscribers must have at least one of these tags
- **Exclude Tags**: Subscribers with any of these tags are excluded
- Leave empty to ignore tag filtering

**Engagement Range:**
- **Minimum Score**: 0-100 (default 0)
- **Maximum Score**: 0-100 (default 100)

3. Click **"Create Segment"**

The system immediately calculates how many subscribers match the criteria.

### Managing Segments

- **Edit**: Modify segment criteria
- **Delete**: Remove segment (doesn't affect subscribers)
- **Subscriber Count**: Auto-updates to show matching subscribers

## Adding Tags to Subscribers

### Manual Tagging (Database)

Use the Lovable Cloud database UI:

1. Open **Database → Tables → newsletter_subscribers**
2. Find the subscriber
3. Edit the `tags` field (array type)
4. Add tags like: `["premium", "interested-in-ai"]`

### Bulk Tagging (SQL)

```sql
-- Add a tag to specific subscribers
UPDATE newsletter_subscribers
SET tags = array_append(tags, 'premium')
WHERE email IN ('user1@example.com', 'user2@example.com');

-- Add multiple tags
UPDATE newsletter_subscribers
SET tags = tags || ARRAY['vip', 'early-adopter']
WHERE subscribed_at < '2024-01-01';

-- Remove a tag
UPDATE newsletter_subscribers
SET tags = array_remove(tags, 'old-tag')
WHERE 'old-tag' = ANY(tags);
```

### Programmatic Tagging

Create an edge function or use the Supabase client:

```typescript
// Add tags to a subscriber
await supabase
  .from("newsletter_subscribers")
  .update({ 
    tags: ["premium", "newsletter"] 
  })
  .eq("email", "user@example.com");

// Append a tag without replacing existing ones
const { data: subscriber } = await supabase
  .from("newsletter_subscribers")
  .select("tags")
  .eq("email", "user@example.com")
  .single();

await supabase
  .from("newsletter_subscribers")
  .update({ 
    tags: [...(subscriber.tags || []), "new-tag"] 
  })
  .eq("email", "user@example.com");
```

## Tracking Engagement Events

### Recording Events

To track email opens and clicks, insert events:

```typescript
// Record an email open
await supabase
  .from("engagement_events")
  .insert({
    subscriber_id: "subscriber-uuid",
    campaign_id: "campaign-uuid", // optional
    event_type: "open",
    event_data: { user_agent: "..." } // optional metadata
  });

// Record a link click
await supabase
  .from("engagement_events")
  .insert({
    subscriber_id: "subscriber-uuid",
    campaign_id: "campaign-uuid",
    event_type: "click",
    event_data: { link_url: "https://example.com" }
  });
```

### Email Tracking Implementation

**Note**: Full email tracking requires:
1. Tracking pixels for opens (1x1 transparent image)
2. Link tracking/redirects for clicks
3. Integration with email service provider (Brevo, etc.)

This is advanced functionality that requires additional setup beyond this system.

## Using Segments in Campaigns

### Campaign Manager Integration

When creating campaigns, you can now target specific segments:

1. Create or edit a campaign
2. Select **"Target Segment"** (optional)
3. Choose a saved segment
4. Campaign will only send to subscribers in that segment

### A/B Test Integration

Similarly, A/B tests can target segments:

1. Create a new A/B test
2. Select **"Target Segment"**
3. Test will only send to the segment's subscribers

## Segment Examples

### Highly Engaged Subscribers
- **Tags Include**: (none)
- **Tags Exclude**: "unengaged", "bounced"
- **Engagement**: 70-100

### New Subscribers (Last 30 Days)
- **Tags Include**: "new"
- **Tags Exclude**: (none)
- **Engagement**: 0-100

### Premium Customers
- **Tags Include**: "premium", "paid"
- **Tags Exclude**: "churned"
- **Engagement**: 0-100

### Re-engagement Target
- **Tags Include**: (none)
- **Tags Exclude**: "unsubscribed"
- **Engagement**: 0-30

### Course Interested
- **Tags Include**: "course-interested", "student"
- **Tags Exclude**: "already-enrolled"
- **Engagement**: 40-100

## Best Practices

### Tagging Strategy

1. **Use Consistent Naming**: Lowercase, hyphenated (e.g., "premium-user", not "Premium User")
2. **Category-Based Tags**: Group tags by type
   - Product: "free-tier", "premium", "enterprise"
   - Interest: "jobs", "courses", "career-tips"
   - Status: "active", "trial", "churned"
   - Behavior: "highly-engaged", "at-risk", "new"

3. **Limit Tag Count**: 3-5 tags per subscriber is ideal
4. **Document Tags**: Keep a list of all tags and their meanings

### Engagement Scoring

1. **Regular Updates**: Run the score update function daily
2. **Monitor Trends**: Track average scores over time
3. **Act on Low Scores**: Create re-engagement campaigns for scores <30
4. **Reward High Scores**: Send exclusive content to scores >70

### Segmentation Tips

1. **Start Broad**: Begin with simple segments (high/medium/low engagement)
2. **Test Segments**: Verify subscriber counts make sense
3. **Avoid Over-Segmentation**: Too many tiny segments reduce effectiveness
4. **Combine Criteria**: Use both tags and engagement for precision
5. **Exclusions Matter**: Use exclude tags to filter out unsubscribes, bounces

## Monitoring & Analytics

### View Segment Performance

In the Segment Manager, you can:
- See real-time subscriber counts
- Track which segments are growing/shrinking
- Identify popular tag combinations

### Engagement Insights

From the Subscriber Management dashboard:
- Sort by engagement score
- Filter by tags
- Export subscriber data with engagement metrics

### Campaign Performance by Segment

After sending targeted campaigns:
1. Compare open rates across segments
2. Identify which segments convert best
3. Refine segment criteria based on results

## Troubleshooting

### Segment Count Shows 0

**Causes:**
- No subscribers match the criteria
- Tag names don't match exactly (case-sensitive)
- Engagement range too restrictive

**Solutions:**
- Check tag spelling and case
- Widen engagement range
- Remove some filters to test

### Engagement Scores Not Updating

**Causes:**
- Update function not running
- No engagement events recorded
- Events older than 90 days

**Solutions:**
- Manually trigger update function
- Verify events are being recorded
- Check event timestamps

### Tags Not Appearing

**Causes:**
- Tags not saved properly
- Array format incorrect
- Database permissions issue

**Solutions:**
- Use correct SQL array syntax: `ARRAY['tag1', 'tag2']`
- Check RLS policies allow updates
- Verify you're editing the correct subscriber

## API Reference

### Database Functions

**get_segment_count(segment_id uuid)**
- Returns: integer
- Calculates how many subscribers match a segment's criteria

**calculate_engagement_score(subscriber_id uuid)**
- Returns: integer (0-100)
- Calculates engagement score for one subscriber

**update_all_engagement_scores()**
- Returns: void
- Updates scores for all subscribers

### Edge Functions

**update-engagement-scores**
- Method: POST
- Auth: Public (no JWT required)
- Updates all subscriber engagement scores

## Future Enhancements

Potential additions to consider:

1. **Automated Tagging**: Rules to auto-tag based on behavior
2. **Segment Analytics Dashboard**: Visual charts and trends
3. **Predictive Scoring**: ML-based churn prediction
4. **Dynamic Segments**: Real-time segment updates
5. **Tag Management UI**: Admin interface for tag CRUD
6. **Bulk Tag Editor**: Multi-select subscribers and apply tags
7. **Segment Templates**: Pre-built segment definitions
8. **A/B Test by Segment**: Compare segment performance

## Support

For issues or questions:
1. Check subscriber data in Lovable Cloud database
2. Review engagement_events table for tracking data
3. Verify segment criteria logic
4. Test with small subscriber samples first
5. Monitor edge function logs for errors
