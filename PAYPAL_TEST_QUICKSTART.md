# Quick Reference: Testing PayPal Endpoints

## Prerequisites

You need to get your Supabase Anonymous Key first. Here's how:

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/gfmhhnynyxvmekhvytgg
2. Navigate to **Settings** → **API**
3. Copy the **anon/public** key

## Run the Test

```powershell
# Set your credentials (replace YOUR_ANON_KEY with the actual key)
$env:SUPABASE_URL="https://gfmhhnynyxvmekhvytgg.supabase.co"
$env:SUPABASE_ANON_KEY="YOUR_ANON_KEY"

# Run the test
.\test-paypal-endpoints.ps1
```

## What to Expect

The test will:
1. ✓ Create a PayPal order
2. ✓ Return an approval URL (you can use this to test payment in PayPal sandbox)
3. ✓ Simulate a webhook event
4. ✓ Verify enrollment creation

## Important Notes

- Make sure you have set **PAYPAL_CLIENT_ID**, **PAYPAL_CLIENT_SECRET**, and **PAYPAL_ENVIRONMENT** in your Supabase Edge Function secrets
- The test uses sandbox mode by default
- Check your Supabase logs for detailed output

## Troubleshooting

If you get errors about missing PayPal credentials:
1. Go to Supabase Dashboard → **Edge Functions** → **Manage secrets**
2. Add these secrets:
   - `PAYPAL_CLIENT_ID` - Your PayPal sandbox client ID
   - `PAYPAL_CLIENT_SECRET` - Your PayPal sandbox secret
   - `PAYPAL_ENVIRONMENT` - Set to `sandbox`
