# ✅ Brevo Integration - List ID 24 Configured

## Summary

The `book-free-session` endpoint is now configured to automatically add all free session bookings to **Brevo List ID 24**.

## What Happens Now

Every time someone books a free session:

1. ✅ **Contact is created/updated** in Brevo with all details
2. ✅ **Automatically added to List 24** (your Free Session Leads list)
3. ✅ **Ready for campaigns** - You can now send targeted emails to this list

## Contact Details Saved

- Email address
- First name & Last name
- WhatsApp number
- Course interest
- Course slug
- Booking date
- Lead source: "free_session_booking"
- Booking ID

## How to Use List 24

### View Your Contacts

1. Go to Brevo Dashboard → **Contacts** → **Lists**
2. Click on **List 24** (Free Session Leads)
3. See all contacts who booked free sessions

### Send a Campaign

1. Go to **Campaigns** → **Email** → **Create campaign**
2. Select recipients: **List 24**
3. Design your email
4. Send or schedule

### Create Automation

1. Go to **Automation** → **Create workflow**
2. Trigger: **Contact enters List 24**
3. Add actions:
   - Wait 2 days → Send follow-up email
   - Wait 5 days → Send course details
   - Wait 7 days → Send enrollment offer

## Test It

Book a test session and verify:

```powershell
$anonKey = "YOUR_ANON_KEY"

$body = @{
    fullName = "Test User"
    email = "test@example.com"
    whatsappNumber = "+44 7700 900000"
    courseSlug = "aml-kyc"
    courseTitle = "AML & KYC Compliance"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://bzxzsidcifkhedydujqb.supabase.co/functions/v1/book-free-session" `
    -Method Post `
    -Headers @{"Content-Type"="application/json"; "Authorization"="Bearer $anonKey"} `
    -Body $body
```

Then check:
1. Brevo Dashboard → Contacts → Search for `test@example.com`
2. Verify contact is in **List 24**
3. Check all attributes are populated

## Next Steps

1. ✅ **Test the integration** - Book a session and verify in Brevo
2. ✅ **Create email campaigns** - Design follow-up sequences
3. ✅ **Set up automation** - Automate the nurture process
4. ✅ **Monitor results** - Track open rates and conversions

---

**Deployment Status:** ✅ Deployed and Active  
**List ID:** 24  
**Endpoint:** `https://bzxzsidcifkhedydujqb.supabase.co/functions/v1/book-free-session`
