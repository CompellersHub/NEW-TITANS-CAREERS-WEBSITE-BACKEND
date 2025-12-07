# Test the Book Free Session Endpoint

# First, let's run the database migration
Write-Host "Step 1: Running database migration..." -ForegroundColor Cyan

# You need to run this SQL in your Supabase SQL Editor:
# Go to: https://supabase.com/dashboard/project/bzxzsidcifkhedydujqb/sql/new
# Copy and paste the contents of migrations/03_create_free_session_bookings.sql

Write-Host "`nStep 2: Testing the endpoint..." -ForegroundColor Cyan

# Test data
$testBody = @{
    fullName = "Test User"
    email = "test@example.com"
    whatsappNumber = "+44 7700 900000"
    courseSlug = "aml-kyc"
    courseTitle = "AML & KYC Compliance"
} | ConvertTo-Json

Write-Host "`nTest Request Body:" -ForegroundColor Yellow
Write-Host $testBody

# You'll need to replace YOUR_ANON_KEY with your actual Supabase anon key
# Get it from: https://supabase.com/dashboard/project/bzxzsidcifkhedydujqb/settings/api

$anonKey = Read-Host "`nEnter your Supabase ANON_KEY"

Write-Host "`nSending request..." -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri "https://bzxzsidcifkhedydujqb.supabase.co/functions/v1/book-free-session" `
        -Method Post `
        -Headers @{
            "Content-Type" = "application/json"
            "Authorization" = "Bearer $anonKey"
        } `
        -Body $testBody

    Write-Host "`n✅ SUCCESS!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Yellow
    $response | ConvertTo-Json -Depth 10 | Write-Host
} catch {
    Write-Host "`n❌ ERROR!" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Error Message: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.ErrorDetails.Message) {
        Write-Host "Details:" -ForegroundColor Yellow
        Write-Host $_.ErrorDetails.Message
    }
}

Write-Host "`n" -NoNewline
