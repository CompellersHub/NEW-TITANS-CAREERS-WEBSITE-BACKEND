# Setting JWT_SECRET Environment Variable

## The Issue
The Supabase CLI is unable to set the `JWT_SECRET` environment variable due to permissions. You'll need to set it manually through the Supabase dashboard.

## Manual Setup Steps

### Step 1: Access Edge Functions Settings
Go to: https://supabase.com/dashboard/project/bzxzsidcifkhedydujqb/settings/functions

### Step 2: Add Environment Variable
1. Look for the "Environment variables" section
2. Click "Add new variable" or similar button
3. Set:
   - **Name**: `JWT_SECRET`
   - **Value**: `ZbvUg1oG4v2Nc1j+YQ1HGoLmuyrcUDBwzht1nCPXv8Z37pdobIwgj8xvJRkSy8Wpl0f/pq6POHOJoXyFtTPA/g==`
4. Save the variable

### Step 3: Verify
After setting the environment variable, test the login endpoint:

```bash
curl -X POST https://bzxzsidcifkhedydujqb.supabase.co/functions/v1/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@example.com","password":"your-password"}'
```

You should now receive a JWT token instead of the "JWT_SECRET not configured" error.

## What Changed
- Updated `supabase/functions/_shared/jwt.ts` to use `JWT_SECRET` instead of `SUPABASE_JWT_SECRET`
- Deployed updated `login`, `register`, and `me` functions

## Note
The JWT secret you provided is your Supabase project's JWT secret, which is the correct one to use for authentication.
