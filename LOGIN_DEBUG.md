# Login Endpoint Debugging Guide

## Error: "No number after minus sign in JSON at position 1"

This error typically means the JWT generation is failing. The most likely cause is that the `SUPABASE_JWT_SECRET` environment variable is not set in your Supabase project.

## Solution: Set the JWT Secret

### Option 1: Use Supabase's JWT Secret (Recommended)

1. **Get your JWT secret** from your Supabase project:
   - Go to: https://supabase.com/dashboard/project/bzxzsidcifkhedydujqb/settings/api
   - Look for "JWT Secret" under "Project API keys"
   - Copy the secret

2. **Set it as an environment variable** in your Supabase project:
   ```bash
   npx -y supabase@2.64.2 secrets set SUPABASE_JWT_SECRET="your-jwt-secret-here" --project-ref bzxzsidcifkhedydujqb
   ```

3. **Redeploy the login function**:
   ```powershell
   $env:SUPABASE_ACCESS_TOKEN="sbp_e2a8bceaffdfaeac7805b4c09e00292535f59b18"
   npx -y supabase@2.64.2 functions deploy login --project-ref bzxzsidcifkhedydujqb --no-verify-jwt
   ```

### Option 2: Use a Custom Secret

If you want to use a custom JWT secret:

1. **Generate a secure random secret**:
   ```bash
   openssl rand -base64 32
   ```

2. **Set it as described in Option 1**

## Testing After Fix

Test the login endpoint:

```bash
curl -X POST https://bzxzsidcifkhedydujqb.supabase.co/functions/v1/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com","password":"your-password"}'
```

Expected response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "your-email@example.com",
    "username": "username",
    "role": "user",
    "userType": "bloguser"
  }
}
```

## Alternative: Check Supabase Logs

To see the actual error:

1. Go to: https://supabase.com/dashboard/project/bzxzsidcifkhedydujqb/logs/edge-functions
2. Look for errors from the `login` function
3. The logs will show if `SUPABASE_JWT_SECRET` is missing

## Quick Fix Command

Run this command to set the secret (replace `YOUR_JWT_SECRET` with your actual secret):

```powershell
$env:SUPABASE_ACCESS_TOKEN="sbp_e2a8bceaffdfaeac7805b4c09e00292535f59b18"
npx -y supabase@2.64.2 secrets set SUPABASE_JWT_SECRET="YOUR_JWT_SECRET" --project-ref bzxzsidcifkhedydujqb
```

Then redeploy:

```powershell
npx -y supabase@2.64.2 functions deploy login --project-ref bzxzsidcifkhedydujqb --no-verify-jwt
npx -y supabase@2.64.2 functions deploy register --project-ref bzxzsidcifkhedydujqb --no-verify-jwt
npx -y supabase@2.64.2 functions deploy me --project-ref bzxzsidcifkhedydujqb
```
