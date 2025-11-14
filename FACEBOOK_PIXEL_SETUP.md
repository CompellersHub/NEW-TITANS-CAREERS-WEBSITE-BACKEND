# Facebook Pixel Setup Guide

This guide explains how to complete the Facebook Pixel integration for conversion tracking and retargeting campaigns.

## Current Implementation

Facebook Pixel has been fully integrated alongside Google Analytics 4 with comprehensive event tracking:

### 1. **Facebook Pixel Base Code** (`index.html`)
- Facebook Pixel script added to HTML head
- Automatic PageView tracking on initial load
- Noscript fallback for users with JavaScript disabled
- **Action Required**: Replace `YOUR_PIXEL_ID` with your actual Facebook Pixel ID

### 2. **Dual-Platform Tracking** (`src/lib/analytics.ts`)
All tracking functions now send events to both GA4 and Facebook Pixel:
- Automatic event mapping (GA4 ↔ Facebook standard events)
- Custom event tracking for platform-specific needs
- Consistent data across both platforms

### 3. **Facebook Standard Events Tracked**

#### **E-commerce Events**
- `PageView` - All page navigation
- `ViewContent` - Course detail page views
- `InitiateCheckout` - "Enroll Now" button clicks
- `Purchase` - Successful course purchases
- `AddToCart` - Future shopping cart functionality

#### **Lead Generation Events**
- `Lead` - Contact form submissions and lead captures
- `Subscribe` - Newsletter signups
- `Contact` - Chat interactions

#### **Engagement Events**
- `Search` - Site searches
- Custom Events:
  - `CTAClick` - CTA interactions
  - `CourseInterest` - Course-related actions
  - `Download` - Resource downloads
  - `VideoView` - Video content plays
  - `ExitIntent` - Exit popup interactions

## Setup Steps

### Step 1: Create/Find Your Facebook Pixel

1. Go to [Facebook Events Manager](https://business.facebook.com/events_manager)
2. Select your business account
3. Click "Connect Data Sources" → "Web" → "Facebook Pixel"
4. If you already have a pixel, copy the Pixel ID
5. If creating new: Follow setup wizard and copy the Pixel ID

Your Pixel ID will be a 15-16 digit number (e.g., `123456789012345`)

### Step 2: Update Your Pixel ID

Replace the placeholder in `index.html` (2 locations):

```html
<!-- Find these lines -->
fbq('init', 'YOUR_PIXEL_ID');

<!-- Replace with your actual ID -->
fbq('init', '123456789012345');

<!-- Also update the noscript tag -->
<img height="1" width="1" style="display:none"
  src="https://www.facebook.com/tr?id=YOUR_PIXEL_ID&ev=PageView&noscript=1"/>

<!-- Replace with -->
<img height="1" width="1" style="display:none"
  src="https://www.facebook.com/tr?id=123456789012345&ev=PageView&noscript=1"/>
```

### Step 3: Verify Installation

1. **Install Facebook Pixel Helper**:
   - Chrome Extension: [Facebook Pixel Helper](https://chrome.google.com/webstore/detail/facebook-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc)
   - Click the extension icon on your site
   - Verify pixel is detected and firing

2. **Use Events Manager Test Events**:
   - Go to Events Manager → Your Pixel → Test Events
   - Enter your website URL
   - Navigate site and verify events appear in real-time

3. **Check Browser Console**:
   - Open DevTools (F12)
   - Look for "FB Pixel Event:" log messages
   - Verify events are firing correctly

### Step 4: Configure Conversions

1. **Mark Key Events as Conversions**:
   - Go to Events Manager → Your Pixel → Aggregated Event Measurement
   - Add these as conversion events (in priority order):
     1. `Purchase`
     2. `InitiateCheckout`
     3. `Lead`
     4. `ViewContent`
     5. `Subscribe`

2. **Set Conversion Values** (optional):
   - Assign monetary values to non-purchase conversions
   - Example: Lead = £50, Subscribe = £10

## Event Mapping Reference

| User Action | GA4 Event | Facebook Pixel Event |
|-------------|-----------|---------------------|
| Page load | `page_view` | `PageView` |
| View course | `view_item` | `ViewContent` |
| Click enroll | `begin_checkout` | `InitiateCheckout` |
| Complete purchase | `purchase` | `Purchase` |
| Submit form | `form_submission` | `Lead` |
| Newsletter signup | `newsletter_signup` | `Subscribe` |
| Click CTA | `cta_click` | `CTAClick` (custom) |
| Search | `search` | `Search` |
| Download | `file_download` | `Download` (custom) |
| Chat interaction | `chat_interaction` | `Contact` |

## Custom Audiences for Retargeting

### Recommended Audiences

1. **All Website Visitors** (180 days)
   - Include: PageView
   - Use for: General awareness retargeting

2. **Course Viewers** (30 days)
   - Include: ViewContent
   - Exclude: Purchase
   - Use for: Course-specific retargeting

3. **Checkout Initiators** (14 days)
   - Include: InitiateCheckout
   - Exclude: Purchase
   - Use for: Abandoned checkout recovery

4. **Engaged Users** (30 days)
   - Include: CTAClick, CourseInterest, Download
   - Use for: High-intent retargeting

5. **Leads** (90 days)
   - Include: Lead, Subscribe
   - Use for: Newsletter/lead nurture campaigns

6. **Past Purchasers** (365 days)
   - Include: Purchase
   - Use for: Cross-sell, upsell campaigns

### Creating Custom Audiences

1. Go to Meta Business Suite → Audiences
2. Click "Create Audience" → "Custom Audience" → "Website"
3. Select your Pixel
4. Choose events and time range
5. Add exclusions if needed
6. Name and save

## Conversion API (Advanced)

For enhanced tracking and iOS 14+ compatibility, implement Facebook Conversion API:

### Server-Side Tracking
Add to your Stripe webhook or purchase confirmation handler:

```typescript
// In your webhook success handler
const fetch = await import('node-fetch');

await fetch('https://graph.facebook.com/v18.0/YOUR_PIXEL_ID/events', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    data: [{
      event_name: 'Purchase',
      event_time: Math.floor(Date.now() / 1000),
      action_source: 'website',
      user_data: {
        em: hashedEmail, // SHA-256 hashed
        ph: hashedPhone, // SHA-256 hashed (optional)
      },
      custom_data: {
        currency: 'GBP',
        value: price,
        content_name: courseName,
        content_ids: [courseSlug],
      }
    }],
    access_token: 'YOUR_CONVERSION_API_TOKEN'
  })
});
```

## Campaign Optimization

### 1. Campaign Objectives
- **Conversions**: Optimize for Purchase or Lead events
- **Traffic**: Drive course page views (ViewContent)
- **Engagement**: Optimize for custom events (CTAClick, CourseInterest)

### 2. Ad Set Targeting
- **Lookalike Audiences**: Create from purchaser audience
- **Interest Targeting**: Professional development, career advancement
- **Behavior Targeting**: Online learners, career changers
- **Geographic**: UK-focused campaigns

### 3. Performance Tracking
Key metrics to monitor:
- Cost per Purchase
- Cost per Lead
- Return on Ad Spend (ROAS)
- Click-through Rate (CTR)
- Add to Cart Rate
- Checkout Completion Rate

## Dynamic Ads Setup

For automated course retargeting:

1. **Create Product Catalog**:
   - Add all courses as products
   - Include: name, price, image, URL

2. **Set up Dynamic Ad Template**:
   - Showcase viewed courses
   - Show related courses
   - Display pricing

3. **Create Dynamic Product Set**:
   - Filter by course category
   - Filter by price range

## Troubleshooting

### Pixel Not Firing
- Check Pixel Helper extension
- Verify Pixel ID is correct
- Ensure no ad blockers active
- Check browser console for errors

### Events Not Recording
- Wait 20 minutes for data to appear
- Check Test Events in real-time
- Verify event names match standard events
- Check for JavaScript errors

### Low Event Match Quality
- Implement Advanced Matching
- Add Conversion API
- Include user data (hashed email, phone)

### iOS 14+ Tracking Issues
- Implement Conversion API
- Use Aggregated Event Measurement
- Prioritize conversion events (max 8)

## Privacy & Compliance

### Cookie Consent
Your site should include a cookie consent banner for EU/UK users:

```typescript
// After user accepts cookies
if (userAcceptedCookies) {
  fbq('consent', 'grant');
} else {
  fbq('consent', 'revoke');
}
```

### Data Deletion Requests
Handle user data deletion requests:
1. Go to Events Manager → Settings → Customer Information
2. Set up Data Deletion Request Callback URL
3. Process deletion requests within 30 days

## Testing Checklist

- [ ] Pixel Helper shows green checkmark
- [ ] PageView fires on every page
- [ ] ViewContent fires on course pages
- [ ] InitiateCheckout fires on "Enroll Now" click
- [ ] Lead fires on form submission
- [ ] Subscribe fires on newsletter signup
- [ ] Custom events appear in Events Manager
- [ ] Test Events shows real-time activity
- [ ] Conversions marked in Event Setup Tool
- [ ] Custom audiences created
- [ ] Campaign created using Pixel events

## Next Steps

1. ✅ Replace `YOUR_PIXEL_ID` in `index.html` (2 locations)
2. ✅ Verify pixel with Facebook Pixel Helper
3. ✅ Configure conversion events in Events Manager
4. ✅ Create custom audiences for retargeting
5. ✅ Set up catalog for dynamic ads
6. ✅ Launch retargeting campaigns
7. ✅ Monitor performance in Ads Manager
8. ✅ Implement Conversion API (optional but recommended)

## Support Resources

- [Facebook Pixel Documentation](https://www.facebook.com/business/help/952192354843755)
- [Standard Events Reference](https://developers.facebook.com/docs/meta-pixel/reference)
- [Conversion API Guide](https://developers.facebook.com/docs/marketing-api/conversions-api)
- [Custom Audiences Help](https://www.facebook.com/business/help/744354708981227)
