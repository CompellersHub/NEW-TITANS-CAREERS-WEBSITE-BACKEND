# Email Engagement Tracking System

This document explains how email engagement tracking works for discussion notification emails.

## Overview

All email links to preferences and unsubscribe actions now go through a tracking endpoint that:
1. Records the click event in the database with geolocation data
2. Handles automatic unsubscribe actions
3. Redirects users to the appropriate page with feedback

## Database Table

**Table:** `email_engagement_tracking`

Tracks all clicks on email links and email opens with the following information:
- `user_id`: ID of the user who clicked (if available)
- `email`: Email address of the recipient
- `link_type`: Type of link clicked (`preferences`, `unsubscribe_digest`, `unsubscribe_all`, `discussion_link`, `email_open`)
- `email_type`: Type of email (`digest`, `instant_notification`, `tracking_pixel`)
- `clicked_at`: Timestamp of the click
- `user_agent`: Browser/client information
- `ip_address`: IP address of the user
- `country`: Country name derived from IP
- `country_code`: ISO country code
- `region`: State/region name
- `city`: City name
- `latitude`: Geographic latitude
- `longitude`: Geographic longitude
- `metadata`: Additional data in JSON format (includes `email_client`)

## Tracking Endpoint

**Edge Function:** `track-email-link`

**URL Format:**
```
https://your-project.supabase.co/functions/v1/track-email-link?email=user@example.com&link_type=preferences&email_type=digest&user_id=xxx&redirect_to=/profile?tab=notifications
```

**Parameters:**
- `email` (required): Email address of the recipient
- `link_type` (required): Type of link being tracked
- `email_type` (required): Type of email this link came from
- `user_id` (optional): User ID if available
- `redirect_to` (optional): Where to redirect after tracking (default: `/profile?tab=notifications`)

## Link Types

### 1. Preferences Link
- **link_type:** `preferences`
- **Action:** Tracks click and redirects to notification settings
- **User sees:** Info toast to manage preferences

### 2. Unsubscribe from Digests
- **link_type:** `unsubscribe_digest`
- **Action:** Changes user's frequency from digest to instant notifications
- **User sees:** Success message confirming they're unsubscribed from digests

### 3. Unsubscribe from All
- **link_type:** `unsubscribe_all`
- **Action:** Disables all email notifications
- **User sees:** Success message confirming they're fully unsubscribed

## Email Integration

### Digest Emails
```typescript
const trackingBaseUrl = `${supabaseUrl}/functions/v1/track-email-link`;

const preferencesUrl = `${trackingBaseUrl}?email=${encodeURIComponent(userEmail)}&link_type=preferences&email_type=digest&user_id=${userId}&redirect_to=/profile?tab=notifications`;

const unsubscribeUrl = `${trackingBaseUrl}?email=${encodeURIComponent(userEmail)}&link_type=unsubscribe_digest&email_type=digest&user_id=${userId}&redirect_to=/profile?tab=notifications`;
```

### Instant Notification Emails
```typescript
const preferencesUrl = `${trackingBaseUrl}?email=${encodeURIComponent(to)}&link_type=preferences&email_type=instant_notification&redirect_to=/profile?tab=notifications`;
```

## URL Parameters Handled by Profile Page

The Profile page listens for the following URL parameters:

- `?action=unsubscribe_digest`: Shows success message for digest unsubscribe
- `?action=unsubscribe_all`: Shows success message for full unsubscribe
- `?action=preferences`: Shows info toast to manage preferences

## Querying Engagement Data

### View all clicks for a specific email
```sql
SELECT * FROM email_engagement_tracking
WHERE email = 'user@example.com'
ORDER BY clicked_at DESC;
```

### Count clicks by link type
```sql
SELECT link_type, COUNT(*) as click_count
FROM email_engagement_tracking
GROUP BY link_type
ORDER BY click_count DESC;
```

### View geographic distribution
```sql
SELECT country, COUNT(*) as events, 
       ROUND(COUNT(*)::numeric / SUM(COUNT(*)) OVER () * 100, 2) as percentage
FROM email_engagement_tracking
WHERE country IS NOT NULL
GROUP BY country
ORDER BY events DESC;
```

### Top cities by engagement
```sql
SELECT city, country, COUNT(*) as events
FROM email_engagement_tracking
WHERE city IS NOT NULL AND country IS NOT NULL
GROUP BY city, country
ORDER BY events DESC
LIMIT 20;
```

### Track unsubscribe rate
```sql
SELECT
  email_type,
  COUNT(*) FILTER (WHERE link_type IN ('unsubscribe_digest', 'unsubscribe_all')) as unsubscribes,
  COUNT(*) as total_clicks,
  ROUND(
    COUNT(*) FILTER (WHERE link_type IN ('unsubscribe_digest', 'unsubscribe_all'))::numeric / 
    COUNT(*)::numeric * 100,
    2
  ) as unsubscribe_rate_percent
FROM email_engagement_tracking
GROUP BY email_type;
```

### View most recent engagement
```sql
SELECT 
  email,
  link_type,
  email_type,
  clicked_at
FROM email_engagement_tracking
ORDER BY clicked_at DESC
LIMIT 50;
```

## Geographic Tracking

The system automatically tracks geographic location data based on IP addresses using the ipapi.co service:

- **IP Address Collection**: Captured from `x-forwarded-for` or `x-real-ip` headers
- **Geolocation Service**: Uses ipapi.co free API for IP-to-location conversion
- **Data Collected**: Country, region, city, and coordinates
- **Privacy**: Only aggregated data is displayed in dashboards
- **Rate Limits**: ipapi.co provides 1,000 requests/day on free tier

### Privacy Considerations

- IP addresses are stored but not displayed in public dashboards
- Geographic data is aggregated for analytics
- Users cannot be individually identified from location data alone
- Consider GDPR compliance if tracking EU users

## Security

- RLS is enabled on the `email_engagement_tracking` table
- Anyone can insert tracking records (for the tracking endpoint to work)
- Only admins can view engagement data
- User identification relies on email matching, not authentication
- The tracking endpoint automatically handles unsubscribe actions without requiring user authentication

## Configuration

Update the following environment variables in your edge functions:
- `APP_URL`: Your application's base URL (for redirects)
- `SUPABASE_URL`: Your Supabase project URL (for tracking endpoint)

## Future Enhancements

Potential improvements to the tracking system:
1. Add click-through rate analytics dashboard ✅ (Implemented)
2. Track email open rates with pixel tracking ✅ (Implemented)
3. A/B test different email templates
4. Implement one-click unsubscribe RFC 8058 compliance
5. Add re-engagement campaigns for inactive users
6. Email client detection ✅ (Implemented)
7. Geographic location tracking ✅ (Implemented)
8. Device type detection (mobile vs desktop)
9. Heatmap visualization for geographic data
