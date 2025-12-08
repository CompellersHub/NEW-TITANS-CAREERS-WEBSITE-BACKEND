# Troubleshooting Brevo Integration

## Issue
Contact not saved to Brevo after booking free session

## Diagnostic Steps

### 1. Check Edge Function Logs

Go to: https://supabase.com/dashboard/project/bzxzsidcifkhedydujqb/functions/book-free-session/logs

Look for:
- ✅ "Booking created successfully" - confirms booking worked
- ✅ "Adding contact to Brevo..." - confirms Brevo code was reached
- ❌ "Brevo contact creation error" - indicates API error
- ❌ "BREVO_API_KEY not configured" - indicates missing API key

### 2. Verify BREVO_API_KEY

**Check if the secret is set:**
1. Go to: https://supabase.com/dashboard/project/bzxzsidcifkhedydujqb/functions/book-free-session
2. Click "Secrets" tab
3. Verify `BREVO_API_KEY` exists

**If missing, add it:**
1. Get your Brevo API key from: https://app.brevo.com/settings/keys/api
2. Add it as a secret in Supabase Edge Function

### 3. Check Brevo API Response

Common errors:
- **401 Unauthorized**: Invalid API key
- **400 Bad Request**: Invalid data format or missing required fields
- **404 Not Found**: List ID 24 doesn't exist
- **Rate limit exceeded**: Too many requests

### 4. Verify Brevo Attributes

The following attributes must exist in Brevo:
- FIRSTNAME
- LASTNAME
- WHATSAPP
- COURSE_INTEREST
- COURSE_SLUG
- BOOKING_DATE
- LEAD_SOURCE
- BOOKING_ID

**Create missing attributes:**
1. Go to Brevo → Contacts → Settings → Contact attributes
2. Create any missing attributes (type: Text)

### 5. Verify List ID 24 Exists

1. Go to Brevo → Contacts → Lists
2. Confirm List ID 24 exists
3. If not, create it or update the code with correct list ID

## Quick Test Script

Run this to see detailed error messages:

```powershell
# Test booking
$anonKey = "YOUR_ANON_KEY"

$body = @{
    fullName = "Debug Test"
    email = "debug@test.com"
    whatsappNumber = "+44 7700 900001"
    courseSlug = "aml-kyc"
    courseTitle = "AML & KYC Compliance"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "https://bzxzsidcifkhedydujqb.supabase.co/functions/v1/book-free-session" `
        -Method Post `
        -Headers @{"Content-Type"="application/json"; "Authorization"="Bearer $anonKey"} `
        -Body $body
    
    Write-Host "✅ Success!" -ForegroundColor Green
    $response | ConvertTo-Json
} catch {
    Write-Host "❌ Error!" -ForegroundColor Red
    $_.Exception.Message
}
```

Then immediately check the logs for Brevo-related messages.

## Common Solutions

### Solution 1: BREVO_API_KEY Not Set
```bash
# Add the secret via Supabase CLI or Dashboard
# Dashboard: Functions → book-free-session → Secrets → Add BREVO_API_KEY
```

### Solution 2: Invalid API Key
- Get a new API key from Brevo
- Update the secret in Supabase

### Solution 3: Missing Attributes
- Create all required attributes in Brevo Dashboard
- Attributes must be uppercase (FIRSTNAME, not firstName)

### Solution 4: Wrong List ID
- Verify List 24 exists in Brevo
- Or update code to use correct list ID

### Solution 5: Brevo Account Issue
- Check if Brevo account is active
- Verify you haven't hit API rate limits
- Check Brevo account status

## Next Steps

1. Check the Edge Function logs first
2. Share the error message you see
3. I'll help fix the specific issue
