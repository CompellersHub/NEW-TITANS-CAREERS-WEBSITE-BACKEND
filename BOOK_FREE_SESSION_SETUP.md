# Book Free Session Feature - Setup Guide

## Overview

This guide explains how to set up and deploy the Book Free Session feature, which allows users to request free consultation sessions for courses.

## Database Migration

### Step 1: Run the Migration

Execute the migration file to create the `free_session_bookings` table:

```sql
-- Run this in your Supabase SQL Editor or via CLI
-- File: migrations/03_create_free_session_bookings.sql
```

**Using Supabase Dashboard:**
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of `migrations/03_create_free_session_bookings.sql`
4. Execute the SQL

**Using Supabase CLI (if available):**
```powershell
supabase db reset
# or
supabase migration up
```

### Step 2: Verify Table Creation

Run this query to verify the table was created:

```sql
SELECT * FROM free_session_bookings LIMIT 1;
```

## Edge Function Deployment

### Deploy the Function

The Edge Function is located at: `supabase/functions/book-free-session/index.ts`

**Option 1: Using Supabase Dashboard**
1. Go to Edge Functions in your Supabase dashboard
2. Create a new function named `book-free-session`
3. Copy the code from `supabase/functions/book-free-session/index.ts`
4. Deploy

**Option 2: Using Supabase CLI**
```powershell
npx supabase functions deploy book-free-session
```

**Option 3: Using the existing deployment pattern**
```powershell
# If you have a deployment script similar to deploy-swagger.ps1
supabase functions deploy book-free-session --project-ref YOUR_PROJECT_REF
```

## API Endpoint

Once deployed, the endpoint will be available at:

```
POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/book-free-session
```

### Request Format

```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "whatsappNumber": "+44 7700 900000",
  "courseSlug": "aml-kyc",
  "courseTitle": "AML & KYC Compliance"
}
```

### Response Format

**Success (200):**
```json
{
  "success": true,
  "bookingId": "uuid-here",
  "message": "Your free session has been booked successfully! We'll contact you within 24 hours."
}
```

**Error (400/429/500):**
```json
{
  "error": "Error message here"
}
```

## Testing

### Test with cURL

```powershell
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/book-free-session `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer YOUR_ANON_KEY" `
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "whatsappNumber": "+44 7700 900000",
    "courseSlug": "aml-kyc",
    "courseTitle": "AML & KYC Compliance"
  }'
```

### Test with PowerShell

```powershell
$body = @{
    fullName = "Test User"
    email = "test@example.com"
    whatsappNumber = "+44 7700 900000"
    courseSlug = "aml-kyc"
    courseTitle = "AML & KYC Compliance"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://YOUR_PROJECT_REF.supabase.co/functions/v1/book-free-session" `
  -Method Post `
  -Headers @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer YOUR_ANON_KEY"
  } `
  -Body $body
```

## Features

### ✅ Form Validation
- All fields are required
- Email format validation
- Proper error messages

### ✅ Rate Limiting
- Maximum 5 bookings per email per hour
- Uses existing `inquiry_rate_limits` table
- Returns 429 status when limit exceeded

### ✅ Course Integration
- Validates course exists in the courses table
- Stores course reference for reporting

### ✅ Email Notifications

**User Confirmation Email:**
- Professional HTML email
- Booking details summary
- Next steps information
- Sent to the user's email address

**Admin Notification Email:**
- New booking alert
- Complete contact information
- Direct WhatsApp contact link
- Sent to marketing@titanscareers.com

### ✅ Database Storage
- All bookings stored in `free_session_bookings` table
- Status tracking (pending, contacted, scheduled, completed, cancelled)
- Admin notes field for internal tracking
- Timestamps for all status changes

## Database Schema

The `free_session_bookings` table includes:

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| full_name | TEXT | User's full name |
| email | TEXT | User's email address |
| whatsapp_number | TEXT | WhatsApp contact number |
| course_id | UUID | Reference to courses table |
| course_slug | TEXT | Course identifier |
| course_title | TEXT | Course display name |
| status | TEXT | Booking status (pending/contacted/scheduled/completed/cancelled) |
| admin_notes | TEXT | Internal notes |
| contacted_by | UUID | Admin who contacted the user |
| contacted_at | TIMESTAMP | When user was contacted |
| scheduled_at | TIMESTAMP | When session is scheduled |
| completed_at | TIMESTAMP | When session was completed |
| created_at | TIMESTAMP | Record creation time |
| updated_at | TIMESTAMP | Last update time |

## Environment Variables

Ensure these environment variables are set in your Supabase project:

- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for database access
- `RESEND_API_KEY` - Resend API key for email notifications

## Next Steps

1. ✅ Deploy the database migration
2. ✅ Deploy the Edge Function
3. ✅ Test the endpoint
4. 🔄 Integrate with your frontend form
5. 🔄 Monitor bookings in the database
6. 🔄 Set up admin dashboard for managing bookings

## Frontend Integration Example

```typescript
async function bookFreeSession(formData: {
  fullName: string;
  email: string;
  whatsappNumber: string;
  courseSlug: string;
  courseTitle: string;
}) {
  const response = await fetch(
    'https://YOUR_PROJECT_REF.supabase.co/functions/v1/book-free-session',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(formData),
    }
  );

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Failed to book session');
  }
  
  return data;
}
```

## Troubleshooting

### Common Issues

**1. Function not deploying:**
- Ensure Supabase CLI is installed
- Check you're logged in: `supabase login`
- Verify project is linked: `supabase link`

**2. Emails not sending:**
- Verify `RESEND_API_KEY` is set in Supabase Edge Function secrets
- Check Resend dashboard for delivery status
- Verify sender email is verified in Resend

**3. Rate limiting not working:**
- Ensure `inquiry_rate_limits` table exists
- Check table permissions

**4. Course not found:**
- Verify course exists in `courses` table
- Check the `data->slug` field matches the `courseSlug` parameter

## Support

For issues or questions, contact the development team or refer to the implementation plan in the artifacts directory.
