# Quick Test Guide for Book Free Session Endpoint

## Step 1: Run Database Migration

**Go to:** https://supabase.com/dashboard/project/bzxzsidcifkhedydujqb/sql/new

**Paste and execute this SQL:**

```sql
-- Create free_session_bookings table
-- This table stores all free consultation session booking requests

CREATE TABLE IF NOT EXISTS free_session_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp_number TEXT NOT NULL,
  course_id UUID REFERENCES courses(id),
  course_slug TEXT NOT NULL,
  course_title TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'scheduled', 'completed', 'cancelled')),
  admin_notes TEXT,
  contacted_by UUID,
  contacted_at TIMESTAMP WITH TIME ZONE,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_free_session_bookings_email ON free_session_bookings(email);
CREATE INDEX IF NOT EXISTS idx_free_session_bookings_status ON free_session_bookings(status);
CREATE INDEX IF NOT EXISTS idx_free_session_bookings_course_slug ON free_session_bookings(course_slug);
CREATE INDEX IF NOT EXISTS idx_free_session_bookings_created_at ON free_session_bookings(created_at DESC);

-- Add comment to table
COMMENT ON TABLE free_session_bookings IS 'Stores free consultation session booking requests from potential students';
```

**Verify the table was created:**
```sql
SELECT * FROM free_session_bookings LIMIT 1;
```

---

## Step 2: Get Your Supabase Anon Key

1. Go to: https://supabase.com/dashboard/project/bzxzsidcifkhedydujqb/settings/api
2. Copy the **anon/public** key (starts with `eyJ...`)

---

## Step 3: Test the Endpoint

### Option A: Using PowerShell (Recommended)

```powershell
# Replace YOUR_ANON_KEY with your actual key from Step 2
$anonKey = "YOUR_ANON_KEY"

$body = @{
    fullName = "Test User"
    email = "test@example.com"
    whatsappNumber = "+44 7700 900000"
    courseSlug = "aml-kyc"
    courseTitle = "AML & KYC Compliance"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "https://bzxzsidcifkhedydujqb.supabase.co/functions/v1/book-free-session" `
    -Method Post `
    -Headers @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $anonKey"
    } `
    -Body $body

$response | ConvertTo-Json -Depth 10
```

### Option B: Using cURL

```bash
curl -X POST https://bzxzsidcifkhedydujqb.supabase.co/functions/v1/book-free-session \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "whatsappNumber": "+44 7700 900000",
    "courseSlug": "aml-kyc",
    "courseTitle": "AML & KYC Compliance"
  }'
```

### Option C: Using the Interactive Script

Run the test script I created:
```powershell
.\test-book-free-session.ps1
```

---

## Expected Response

### ✅ Success (200):
```json
{
  "success": true,
  "bookingId": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Your free session has been booked successfully! We'll contact you within 24 hours."
}
```

### ❌ Missing Fields (400):
```json
{
  "error": "Missing required fields. Please provide fullName, email, whatsappNumber, courseSlug, and courseTitle."
}
```

### ❌ Invalid Email (400):
```json
{
  "error": "Invalid email format."
}
```

### ❌ Rate Limited (429):
```json
{
  "error": "Too many booking requests. Please try again later.",
  "rateLimited": true
}
```

---

## Step 4: Verify the Data

After a successful test, check the database:

```sql
SELECT 
  id,
  full_name,
  email,
  whatsapp_number,
  course_slug,
  course_title,
  status,
  created_at
FROM free_session_bookings
ORDER BY created_at DESC
LIMIT 5;
```

---

## Step 5: Check Email Delivery

If you have RESEND_API_KEY configured:
1. Check your email (test@example.com) for the confirmation
2. Check marketing@titanscareers.com for the admin notification

---

## Test Scenarios

### Test 1: Valid Booking ✅
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "whatsappNumber": "+44 7700 900000",
  "courseSlug": "aml-kyc",
  "courseTitle": "AML & KYC Compliance"
}
```

### Test 2: Missing Field ❌
```json
{
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "courseSlug": "data-analysis"
}
```
Expected: 400 error

### Test 3: Invalid Email ❌
```json
{
  "fullName": "Bob Smith",
  "email": "not-an-email",
  "whatsappNumber": "+44 7700 900001",
  "courseSlug": "cybersecurity",
  "courseTitle": "Cybersecurity Fundamentals"
}
```
Expected: 400 error

### Test 4: Rate Limiting ❌
Submit the same email 6 times quickly.
Expected: First 5 succeed, 6th returns 429

---

## Troubleshooting

**Error: "Failed to create booking"**
- Check that the database migration ran successfully
- Verify the `free_session_bookings` table exists

**Error: "Authorization header required"**
- Make sure you're including the Authorization header
- Verify your anon key is correct

**No email received:**
- Check that RESEND_API_KEY is set in Supabase Edge Function secrets
- Go to: https://supabase.com/dashboard/project/bzxzsidcifkhedydujqb/functions/book-free-session
- Click "Secrets" and verify RESEND_API_KEY is set

**Error: "Course not found"**
- The course_id lookup is optional and won't fail the request
- The booking will still be created with course_slug and course_title
