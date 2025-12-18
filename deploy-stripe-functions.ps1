$env:SUPABASE_ACCESS_TOKEN="sbp_e2a8bceaffdfaeac7805b4c09e00292535f59b18"
Write-Host "Deploying create-checkout-session..."
npx -y supabase@2.64.2 functions deploy create-checkout-session --project-ref bzxzsidcifkhedydujqb --no-verify-jwt
Write-Host "Deploying stripe-webhook..."
npx -y supabase@2.64.2 functions deploy stripe-webhook --project-ref bzxzsidcifkhedydujqb --no-verify-jwt
