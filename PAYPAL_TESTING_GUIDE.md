# PayPal Payment Endpoints Testing Guide

## Quick Start

### 1. Set Environment Variables

Before running the tests, set your Supabase credentials:

```powershell
# Windows PowerShell
$env:SUPABASE_URL="https://gfmhhnynyxvmekhvytgg.supabase.co"
$env:SUPABASE_ANON_KEY="your-anon-key-here"
```

### 2. Run the Test Script

```powershell
.\test-paypal-endpoints.ps1
```

Or with inline parameters:

```powershell
.\test-paypal-endpoints.ps1 -SupabaseUrl "https://gfmhhnynyxvmekhvytgg.supabase.co" -SupabaseAnonKey "your-anon-key"
```

## What the Test Does

The test script will:

1. **Create a PayPal Order**
   - Sends a request to `create-paypal-order` endpoint
   - Creates a payment intent in your database
   - Returns a PayPal approval URL

2. **Simulate Webhook Event**
   - Sends a simulated `PAYMENT.CAPTURE.COMPLETED` event
   - Updates payment intent status to 'completed'
   - Creates an enrollment record
   - Triggers confirmation email (if RESEND_API_KEY is set)

## Expected Output

```
████████████████████████████████████████████████████████████
  PayPal Payment Endpoints Test Suite
████████████████████████████████████████████████████████████

ℹ Supabase URL: https://your-project.supabase.co
ℹ Testing with email: test@example.com

============================================================
TEST 1: Create PayPal Order
============================================================

ℹ Sending request to create-paypal-order endpoint...
ℹ Course: Test Course Title
ℹ Price: £99.99
ℹ Email: test@example.com
✓ PayPal order created successfully!

Response Data:
{
  "success": true,
  "approvalUrl": "https://www.sandbox.paypal.com/checkoutnow?token=...",
  "paymentIntentId": "...",
  "orderId": "..."
}

ℹ Approval URL (use this to complete payment in sandbox):
https://www.sandbox.paypal.com/checkoutnow?token=...

⚠ Note: You need to log in to PayPal Sandbox to complete the payment
⚠ Visit: https://www.sandbox.paypal.com/

============================================================
TEST 2: Simulate PayPal Webhook
============================================================

ℹ Sending simulated webhook event...
✓ Webhook processed successfully!

============================================================
TEST SUMMARY
============================================================

✓ Create PayPal Order: PASSED
✓ PayPal Webhook: PASSED

🎉 All tests passed!
```

## Troubleshooting

### Error: "PayPal credentials not configured"

**Solution:** Ensure you have set the following secrets in Supabase:
1. Go to Supabase Dashboard → Project Settings → Edge Functions
2. Add these secrets:
   - `PAYPAL_CLIENT_ID`
   - `PAYPAL_CLIENT_SECRET`
   - `PAYPAL_ENVIRONMENT` (set to `sandbox`)

### Error: "Failed to get PayPal access token"

**Possible causes:**
- Invalid PayPal credentials
- Wrong environment (production vs sandbox)
- Network connectivity issues

**Solution:**
- Verify your PayPal sandbox credentials at https://developer.paypal.com/
- Ensure `PAYPAL_ENVIRONMENT` is set to `sandbox`

### Error: "Payment intent not found"

**Possible causes:**
- Database table `payment_intents` doesn't exist
- Database permissions issue

**Solution:**
- Check if the `payment_intents` table exists in your Supabase database
- Verify the table has the correct schema

## Manual Testing with PayPal Sandbox

For complete end-to-end testing:

1. **Run the test script** to get an approval URL
2. **Copy the approval URL** from the test output
3. **Open the URL** in your browser
4. **Log in** to PayPal Sandbox with a test buyer account
5. **Complete the payment**
6. **Check Supabase logs** to see the webhook being processed
7. **Verify database records**:
   - `payment_intents` table: status should be 'completed'
   - `enrollments` table: new record should exist

## Database Verification Queries

After running tests, verify the data in Supabase:

```sql
-- Check payment intents
SELECT * FROM payment_intents 
WHERE customer_email = 'test@example.com' 
ORDER BY created_at DESC 
LIMIT 5;

-- Check enrollments
SELECT * FROM enrollments 
WHERE customer_email = 'test@example.com' 
ORDER BY created_at DESC 
LIMIT 5;
```

## Next Steps

After successful testing:
- [ ] Test with real PayPal sandbox account
- [ ] Verify email delivery (if RESEND_API_KEY is configured)
- [ ] Test error scenarios (invalid data, network failures)
- [ ] Review Supabase Edge Function logs
- [ ] Test webhook signature verification (for production)
