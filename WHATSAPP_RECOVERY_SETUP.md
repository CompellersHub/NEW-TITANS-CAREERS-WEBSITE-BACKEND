# WhatsApp Abandoned Checkout Recovery Setup

This guide explains how to set up WhatsApp messaging for abandoned checkout recovery using Brevo's WhatsApp Business API integration.

## Why WhatsApp?

WhatsApp offers the highest engagement rates among all messaging channels:
- **📈 98% open rate** (vs 20% for email, 98% for SMS)
- **📱 90% read within 3 minutes** of delivery
- **🎯 30-40% click-through rates** on messages
- **💬 Two-way communication** for customer support
- **🌍 2+ billion users worldwide**

Combined with email and SMS, WhatsApp completes your tri-channel recovery strategy for maximum conversion.

## Prerequisites

### 1. Brevo Account Requirements
- Active Brevo account (Business plan or higher required for WhatsApp)
- Verified business domain
- Existing `BREVO_API_KEY` configured in Lovable Cloud

### 2. WhatsApp Business API Setup

**Step 1: Apply for WhatsApp Business API Access**
1. Go to Brevo Dashboard → **WhatsApp**
2. Click "Get Started with WhatsApp Business"
3. Submit your business information:
   - Legal business name
   - Business website (must be verified)
   - Business address
   - Business category
   - Tax ID/Registration number

**Step 2: Meta Business Verification**
1. Meta will review your application (2-7 business days)
2. You'll need to verify your business with Meta:
   - Business documents (registration, tax documents)
   - Website ownership verification
   - Phone number verification

**Step 3: WhatsApp Number Setup**
1. Choose your WhatsApp business number:
   - New number (recommended for dedicated business line)
   - Migrate existing WhatsApp Business number
2. Verify the phone number with OTP
3. Set up your business profile:
   - Business name
   - Profile photo (logo)
   - Business description
   - Business hours
   - Website link

**Step 4: Create Message Templates**

WhatsApp requires pre-approved templates for sending messages. You need to create 3 templates in Brevo:

**Template 1: Reminder (1 hour)**
```
Template Name: checkout_reminder_1h
Category: MARKETING
Language: English

Message:
Hi {{1}}, you left {{2}} in your cart! 🛒
Complete your enrollment now and start learning today.
{{3}}
```

**Template 2: Discount Offer (24 hours)**
```
Template Name: checkout_discount_24h
Category: MARKETING
Language: English

Message:
🎉 Special offer, {{1}}!
Get {{2}} OFF {{3}} with code *{{4}}*

Valid for {{5}} only. Don't miss out!
{{6}}
```

**Template 3: Final Urgency (72 hours)**
```
Template Name: checkout_final_72h
Category: MARKETING
Language: English

Message:
⏰ LAST CHANCE {{1}}!
{{2}} OFF {{3}} with code *{{4}}*

Expires {{5}}! This is your final opportunity.
{{6}}
```

**Template Approval Process:**
1. Go to Brevo → WhatsApp → Templates
2. Click "Create Template"
3. Fill in template details
4. Submit for Meta approval (usually 24-48 hours)
5. Wait for approval before testing

### 3. Get Template IDs

Once templates are approved:
1. Go to Brevo → WhatsApp → Templates
2. Find each template and note the Template ID
3. Update the edge function with your template IDs:

```typescript
// In process-abandoned-checkouts/index.ts
// Update these template IDs with your actual IDs from Brevo
templateId: 1  // Replace with your checkout_reminder_1h template ID
templateId: 2  // Replace with your checkout_discount_24h template ID
templateId: 3  // Replace with your checkout_final_72h template ID
```

## How It Works

### Multi-Channel Strategy

The system now sends messages across 3 channels:

**1 Hour After Abandonment:**
- 📧 Email: Detailed reminder with course benefits
- 📱 SMS: Quick text reminder with link
- 💬 WhatsApp: Rich media message with business branding

**24 Hours After Abandonment:**
- 📧 Email: Visual discount offer (10% off)
- 📱 SMS: Text offer notification
- 💬 WhatsApp: Interactive discount message with code

**72 Hours After Abandonment:**
- 📧 Email: Final urgency with countdown
- 📱 SMS: Last chance text alert
- 💬 WhatsApp: Urgent final offer message

### Database Tracking

The system tracks all WhatsApp messages in the `checkout_abandonment_whatsapp` table:
- Message sequence (1, 2, 3)
- Send timestamp
- Delivery status
- Read receipts
- Click tracking
- Conversion tracking
- Message ID from Brevo

### Phone Number Collection

WhatsApp numbers are collected from:
1. **Contact Form**: Optional WhatsApp field
2. **Stored in localStorage**: Used for checkout tracking
3. **Saved in database**: Associated with checkout session

## Message Flow Examples

### Message 1 (1 Hour):
```
Hi John, you left AWS Solutions Architect in your cart! 🛒
Complete your enrollment now and start learning today.
https://example.com/courses/aws-solutions-architect
```

### Message 2 (24 Hours):
```
🎉 Special offer, John!
Get 10% OFF AWS Solutions Architect with code *COMEBACK10*

Valid for 48 hours only. Don't miss out!
https://example.com/courses/aws-solutions-architect
```

### Message 3 (72 Hours):
```
⏰ LAST CHANCE John!
15% OFF AWS Solutions Architect with code *LASTCHANCE15*

Expires TONIGHT! This is your final opportunity.
https://example.com/courses/aws-solutions-architect
```

## Cost Structure

### Brevo WhatsApp Pricing
- **Template Messages**: £0.02 - £0.05 per message (varies by country)
- **Conversation Window**: 24 hours per conversation
- **Business Initiated**: Template messages required
- **User Initiated**: Free-form messages allowed within 24h window

### Cost Comparison
| Channel | Cost per Send | Open Rate | Click Rate | Conv. Rate |
|---------|--------------|-----------|------------|------------|
| Email   | Free (300/day) | 20-30% | 2-5% | 1-3% |
| SMS     | £0.038 | 98% | 5-10% | 3-8% |
| WhatsApp | £0.03 | 98% | 15-30% | 10-20% |

### ROI Analysis
- **Average course price**: £500
- **3-channel sequence cost**: £0.168 (email + SMS + WhatsApp)
- **Expected recovery rate**: 20-30% (with WhatsApp)
- **ROI**: 300-500x

## Testing

### Manual Testing

1. **Fill out contact form** with WhatsApp number
2. **Start a checkout** but don't complete
3. **Manually trigger** the edge function
4. **Check your WhatsApp** for message

### Verify Messages Sent

```sql
-- Check all WhatsApp messages
SELECT * FROM checkout_abandonment_whatsapp 
ORDER BY sent_at DESC 
LIMIT 10;

-- Check multi-channel coverage
SELECT 
  cs.email,
  cs.name,
  cs.phone,
  cs.whatsapp,
  COUNT(DISTINCT cae.id) as emails_sent,
  COUNT(DISTINCT cas.id) as sms_sent,
  COUNT(DISTINCT caw.id) as whatsapp_sent
FROM checkout_sessions cs
LEFT JOIN checkout_abandonment_emails cae ON cs.id = cae.checkout_session_id
LEFT JOIN checkout_abandonment_sms cas ON cs.id = cas.checkout_session_id
LEFT JOIN checkout_abandonment_whatsapp caw ON cs.id = caw.checkout_session_id
WHERE cs.created_at > NOW() - INTERVAL '24 hours'
GROUP BY cs.id
ORDER BY cs.created_at DESC;
```

## Analytics & Performance

### WhatsApp Performance Metrics

```sql
SELECT 
  whatsapp_sequence_number,
  COUNT(*) as sent,
  SUM(CASE WHEN delivered THEN 1 ELSE 0 END) as delivered,
  SUM(CASE WHEN read THEN 1 ELSE 0 END) as read,
  SUM(CASE WHEN clicked THEN 1 ELSE 0 END) as clicked,
  SUM(CASE WHEN converted THEN 1 ELSE 0 END) as converted,
  ROUND(SUM(CASE WHEN delivered THEN 1 ELSE 0 END)::numeric / COUNT(*) * 100, 2) as delivery_rate,
  ROUND(SUM(CASE WHEN read THEN 1 ELSE 0 END)::numeric / COUNT(*) * 100, 2) as read_rate,
  ROUND(SUM(CASE WHEN clicked THEN 1 ELSE 0 END)::numeric / COUNT(*) * 100, 2) as click_rate,
  ROUND(SUM(CASE WHEN converted THEN 1 ELSE 0 END)::numeric / COUNT(*) * 100, 2) as conversion_rate
FROM checkout_abandonment_whatsapp
GROUP BY whatsapp_sequence_number
ORDER BY whatsapp_sequence_number;
```

### Channel Comparison

```sql
-- Compare all 3 channels
WITH channel_stats AS (
  SELECT 
    'Email' as channel,
    COUNT(*) as sent,
    SUM(CASE WHEN opened THEN 1 ELSE 0 END) as engaged,
    SUM(CASE WHEN converted THEN 1 ELSE 0 END) as converted
  FROM checkout_abandonment_emails
  UNION ALL
  SELECT 
    'SMS' as channel,
    COUNT(*) as sent,
    SUM(CASE WHEN delivered THEN 1 ELSE 0 END) as engaged,
    SUM(CASE WHEN converted THEN 1 ELSE 0 END) as converted
  FROM checkout_abandonment_sms
  UNION ALL
  SELECT 
    'WhatsApp' as channel,
    COUNT(*) as sent,
    SUM(CASE WHEN read THEN 1 ELSE 0 END) as engaged,
    SUM(CASE WHEN converted THEN 1 ELSE 0 END) as converted
  FROM checkout_abandonment_whatsapp
)
SELECT 
  channel,
  sent,
  engaged,
  converted,
  ROUND(engaged::numeric / sent * 100, 2) as engagement_rate,
  ROUND(converted::numeric / sent * 100, 2) as conversion_rate
FROM channel_stats
ORDER BY conversion_rate DESC;
```

## Troubleshooting

### WhatsApp Not Sending

1. **Check Template Approval Status**
   - Go to Brevo → WhatsApp → Templates
   - Ensure all templates are "Approved"
   - Rejected templates need to be edited and resubmitted

2. **Check WhatsApp Business API Status**
   - Verify your Meta Business account is verified
   - Check if WhatsApp Business API is active
   - Ensure phone number is properly configured

3. **Check Phone Number Format**
   - Must include country code (e.g., +44 for UK)
   - No spaces or special characters
   - Stored in international E.164 format

4. **Check Template IDs**
   - Verify template IDs in edge function match Brevo
   - Template IDs are numbers, not template names

5. **Check Brevo Logs**
   - Go to Brevo → WhatsApp → Logs
   - Look for delivery failures or errors
   - Common errors:
     - "Invalid template ID"
     - "Template not approved"
     - "Invalid phone number format"
     - "Insufficient credits"

### Message Not Delivered

1. **Check User's WhatsApp Status**
   - User must have WhatsApp installed
   - Number must be registered with WhatsApp
   - User hasn't blocked your business number

2. **Check 24-Hour Window**
   - Template messages work anytime
   - Free-form messages only within 24h of user message

3. **Check Message Content**
   - Must match approved template exactly
   - Parameters must be in correct order
   - No unauthorized variable substitutions

### Low Engagement

1. **Template Optimization**
   - A/B test different message templates
   - Use emojis strategically
   - Keep messages concise (under 160 chars when possible)
   - Clear call-to-action

2. **Timing Optimization**
   - Test different send times
   - Consider user's timezone
   - Avoid late night/early morning

3. **Personalization**
   - Use customer's first name
   - Reference specific course
   - Show actual pricing/discounts

## Best Practices

### Message Design
- ✅ Use emojis to increase engagement
- ✅ Keep messages conversational and friendly
- ✅ Include clear call-to-action buttons
- ✅ Show urgency without being pushy
- ✅ Personalize with customer name and course

### Frequency Management
- ✅ Respect the 3-message sequence limit
- ✅ Don't send if user is already active elsewhere
- ✅ Stop sending if user completes purchase
- ✅ Honor opt-out requests immediately

### Compliance
- ✅ Get explicit opt-in for WhatsApp
- ✅ Provide easy opt-out mechanism
- ✅ Comply with Meta's WhatsApp policies
- ✅ Follow GDPR and local privacy laws
- ✅ Don't send promotional content to personal numbers

### Template Guidelines
- ✅ Templates must provide value to user
- ✅ Avoid spam-like language
- ✅ Include opt-out instructions
- ✅ Be transparent about business identity
- ✅ Keep templates updated and relevant

## Advanced Features

### Rich Media Messages
WhatsApp supports:
- Images (course thumbnails)
- Videos (course previews)
- Documents (course syllabus)
- Interactive buttons
- Quick reply buttons
- List messages

### Two-Way Conversations
When users reply to your WhatsApp messages:
1. Opens 24-hour conversation window
2. You can send free-form messages
3. Provide customer support
4. Answer questions about courses
5. Help complete enrollment

### Automation Enhancements
- Trigger messages based on cart value
- Send different messages by course category
- Dynamic discount amounts based on user history
- Personalized timing based on past behavior

## Support & Resources

### Brevo WhatsApp Documentation
- [WhatsApp Business API Setup](https://developers.brevo.com/docs/whatsapp-business-api)
- [Message Templates Guide](https://developers.brevo.com/docs/create-whatsapp-templates)
- [WhatsApp API Reference](https://developers.brevo.com/reference/sendwhatsappmessage)

### Meta Resources
- [WhatsApp Business Policy](https://www.whatsapp.com/legal/business-policy)
- [Message Template Guidelines](https://developers.facebook.com/docs/whatsapp/message-templates/guidelines)
- [WhatsApp Commerce Policy](https://www.whatsapp.com/legal/commerce-policy)

### Getting Help
- Brevo Support: https://help.brevo.com
- Meta Business Support: https://business.facebook.com/help
- WhatsApp Developer Support: https://developers.facebook.com/support

## Future Enhancements

Potential improvements:
- [ ] Rich media messages with course images
- [ ] Interactive button messages for quick enrollment
- [ ] Chatbot integration for instant support
- [ ] Order status updates via WhatsApp
- [ ] Course completion reminders
- [ ] Re-engagement campaigns for inactive users
- [ ] WhatsApp Stories for course highlights
