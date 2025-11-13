# Brevo Email Integration Setup

This project uses Brevo (formerly Sendinblue) for sending newsletter welcome emails and future campaign emails.

## Setup Instructions

### 1. Create a Brevo Account
- Sign up at [https://www.brevo.com](https://www.brevo.com)
- The free plan includes 300 emails per day

### 2. Verify Your Sender Email Domain
**CRITICAL:** You must verify your sender email domain before sending emails.

1. Go to **Settings → Senders & IP**
2. Add and verify your domain (e.g., titanscareer.com)
3. Follow the DNS verification steps
4. Wait for verification (usually 24-48 hours)

### 3. Update the Edge Function
Once your domain is verified, update the sender email in:
`supabase/functions/newsletter-signup/index.ts`

Change this line:
```typescript
sender: {
  name: "Titans Careers",
  email: "noreply@titanscareer.com", // Replace with your verified sender email
},
```

To use your verified email:
```typescript
sender: {
  name: "Titans Careers",
  email: "noreply@yourdomain.com", // Your verified email
},
```

### 4. Get Your API Key
1. Go to **Settings → SMTP & API → API Keys**
2. Create a new API key
3. Copy the key (you won't be able to see it again!)
4. The API key is already stored in your Supabase secrets as `BREVO_API_KEY`

### 5. Test the Integration
1. Visit your site and submit the newsletter form
2. Check if you receive the welcome email
3. Check the Supabase Edge Function logs for any errors

## Newsletter Features

### Current Implementation
- ✅ Newsletter signup forms on multiple pages (Footer, Blog, Resources)
- ✅ Email and WhatsApp capture
- ✅ Automated welcome email via Brevo
- ✅ Duplicate email protection
- ✅ Database storage of all subscribers

### Database Schema
Subscribers are stored in the `newsletter_subscribers` table with:
- Email (required, unique)
- Name (optional)
- WhatsApp number (optional)
- Source (where they signed up from)
- Subscription date
- Active status
- Welcome email sent flag

### Future Enhancements
You can extend this system to:
- Send weekly career tips automatically
- Create email campaigns in Brevo dashboard
- Segment subscribers by source/interest
- Add unsubscribe functionality
- Set up WhatsApp Business API integration

## Brevo Dashboard Features

### Email Campaigns
Create and send email campaigns to your subscribers:
1. Go to **Campaigns → Email**
2. Create a new campaign
3. Import contacts from your database
4. Design your email
5. Schedule or send immediately

### Transactional Emails
For automated emails (welcome, password reset, etc.):
1. Go to **Transactional → Templates**
2. Create email templates
3. Use them in your edge functions

### Contact Management
Manage your subscriber list:
1. Go to **Contacts**
2. Import/export contacts
3. Create segments
4. View statistics

## Troubleshooting

### Email Not Sending
1. Check edge function logs in Supabase
2. Verify your sender email is validated in Brevo
3. Check your Brevo API key is correct
4. Ensure you haven't hit daily sending limits

### Email in Spam
1. Complete SPF, DKIM, DMARC verification in Brevo
2. Warm up your sending domain gradually
3. Encourage subscribers to whitelist your email
4. Ensure content isn't too "sales-y"

### WhatsApp Integration (Future)
To send messages via WhatsApp:
1. Apply for WhatsApp Business API
2. Get approval from Meta
3. Integrate with your Brevo account or use separate WhatsApp API service
4. Update edge function to send WhatsApp messages

## Support

- Brevo Documentation: https://developers.brevo.com/
- Brevo Support: https://help.brevo.com/
- Supabase Edge Functions: https://supabase.com/docs/guides/functions
