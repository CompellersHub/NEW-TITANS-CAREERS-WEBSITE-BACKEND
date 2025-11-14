# Google Analytics 4 Setup Guide

This guide explains how to complete the GA4 integration for your Titans Training Group website.

## Current Implementation

Google Analytics 4 has been integrated with comprehensive event tracking throughout the site:

### 1. **GA4 Script Tag** (`index.html`)
- The GA4 script tag has been added to the HTML head
- Page views are tracked manually through React Router for SPA support
- **Action Required**: Replace `G-XXXXXXXXXX` with your actual GA4 Measurement ID

### 2. **Analytics Utility** (`src/lib/analytics.ts`)
Comprehensive tracking functions for:
- Page views
- CTA clicks
- Form submissions
- Lead generation
- Course views and interest
- Checkout flow (begin_checkout, purchase)
- Newsletter signups
- File downloads
- Search queries
- Video plays
- Chat interactions
- Exit intent

### 3. **Tracked Components**

#### **App.tsx**
- Automatic page view tracking on route changes
- Tracks all navigation throughout the site

#### **ContactForm.tsx**
- Form submission tracking
- Lead generation tracking with company data

#### **StripeCheckoutButton.tsx**
- `begin_checkout` event when user clicks purchase
- Voucher application tracking
- Includes item details (course name, slug, price)

#### **CTA.tsx**
- WhatsApp CTA clicks
- Email CTA clicks
- Location and action metadata

## Setup Steps

### Step 1: Get Your GA4 Measurement ID

1. Go to [Google Analytics](https://analytics.google.com/)
2. Create a new GA4 property or use an existing one
3. Navigate to: Admin → Data Streams → Web
4. Copy your Measurement ID (format: `G-XXXXXXXXXX`)

### Step 2: Update the Measurement ID

Replace the placeholder in `index.html`:

```html
<!-- Find this line -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>

<!-- Replace with your actual ID -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-YOUR-ACTUAL-ID"></script>

<!-- Also update this line -->
gtag('config', 'G-XXXXXXXXXX', {
  send_page_view: false
});

<!-- To -->
gtag('config', 'G-YOUR-ACTUAL-ID', {
  send_page_view: false
});
```

### Step 3: Verify Implementation

1. **Using GA4 DebugView**:
   - In GA4, go to: Configure → DebugView
   - Add `?debug_mode=true` to your URL
   - Verify events are being received

2. **Using Browser Console**:
   - Open DevTools (F12)
   - Check console logs for "GA4 Event:" messages
   - Verify events are firing correctly

3. **Test Key Events**:
   - Navigate between pages → Check `page_view` events
   - Click CTAs → Check `cta_click` events
   - Submit contact form → Check `form_submission` and `generate_lead` events
   - View course → Check `view_item` event
   - Start checkout → Check `begin_checkout` event

## Tracked Events Reference

### Standard E-commerce Events
- `page_view` - Automatic on all route changes
- `view_item` - When viewing course details
- `begin_checkout` - When clicking "Enroll Now" button
- `purchase` - Stripe webhook completion (requires setup)

### Custom Events
- `cta_click` - All CTA interactions (WhatsApp, Email, etc.)
- `form_submission` - Contact form submissions
- `generate_lead` - Lead capture events
- `course_interest` - Course-related actions (voucher apply, etc.)
- `newsletter_signup` - Newsletter subscriptions
- `file_download` - Resource downloads
- `search` - Site searches
- `video_start` - Video content plays
- `chat_interaction` - Chatbot engagements
- `exit_intent` - Exit popup interactions

## Enhanced Tracking (Optional)

### 1. Enhanced Ecommerce Tracking
To track actual purchases, add this to your Stripe webhook success handler:

```typescript
import { trackPurchase } from '@/lib/analytics';

// In your webhook success handler
trackPurchase(
  courseSlug,
  courseTitle,
  price,
  stripeSessionId
);
```

### 2. User ID Tracking
If you implement authentication:

```typescript
// After user login
gtag('config', 'G-YOUR-MEASUREMENT-ID', {
  'user_id': userId
});
```

### 3. Custom Dimensions
Set up custom dimensions in GA4 for:
- Course Category
- Lead Source
- User Type (new/returning)
- Campaign Attribution

## Key Reports to Set Up in GA4

1. **Conversions**:
   - Mark `form_submission` as conversion
   - Mark `begin_checkout` as conversion
   - Mark `purchase` as conversion
   - Mark `generate_lead` as conversion

2. **Custom Explorations**:
   - Course funnel (view_item → begin_checkout → purchase)
   - Lead generation sources
   - CTA effectiveness by location
   - Page engagement metrics

3. **Audiences**:
   - Course viewers who didn't purchase
   - Form submitters
   - High-engagement users
   - Newsletter subscribers

## Troubleshooting

### Events not showing in GA4
- Verify Measurement ID is correct
- Check browser console for errors
- Ensure ad blockers are disabled during testing
- Wait 24-48 hours for data to populate in reports

### Multiple page_view events
- This is normal for SPAs
- GA4 handles this correctly
- Verify `send_page_view: false` in config

### Events firing multiple times
- Check for duplicate tracking code
- Verify component re-renders aren't causing issues
- Use React's dependency arrays correctly

## Next Steps

1. ✅ Replace GA4 Measurement ID in `index.html`
2. ✅ Test all tracked events using DebugView
3. ✅ Mark key events as conversions in GA4
4. ✅ Set up custom reports and explorations
5. ✅ Create audiences for remarketing
6. ✅ Connect to Google Ads (if using)
7. ✅ Set up conversion tracking for Stripe purchases

## Support

For GA4-specific questions:
- [GA4 Documentation](https://support.google.com/analytics/answer/10089681)
- [GA4 Events Reference](https://developers.google.com/analytics/devguides/collection/ga4/reference/events)
- [Measurement Protocol](https://developers.google.com/analytics/devguides/collection/protocol/ga4)
