# PayPal Payment Endpoints Test Script (PowerShell)
# This script tests the PayPal payment flow using PowerShell

param(
    [string]$SupabaseUrl = "",
    [string]$SupabaseAnonKey = ""
)

# Color output functions
function Write-Success { 
    param([string]$Message) 
    Write-Host "✓ $Message" -ForegroundColor Green 
}

function Write-ErrorCustom { 
    param([string]$Message) 
    Write-Host "✗ $Message" -ForegroundColor Red 
}

function Write-InfoCustom { 
    param([string]$Message) 
    Write-Host "ℹ $Message" -ForegroundColor Cyan 
}

function Write-WarningCustom { 
    param([string]$Message) 
    Write-Host "⚠ $Message" -ForegroundColor Yellow 
}

function Write-Section { 
    param([string]$Title) 
    Write-Host "`n============================================================" -ForegroundColor Cyan
    Write-Host $Title -ForegroundColor Cyan
    Write-Host "============================================================`n" -ForegroundColor Cyan
}

# Get credentials from environment or parameters
if ([string]::IsNullOrEmpty($SupabaseUrl)) {
    $SupabaseUrl = $env:SUPABASE_URL
}
if ([string]::IsNullOrEmpty($SupabaseAnonKey)) {
    $SupabaseAnonKey = $env:SUPABASE_ANON_KEY
}

# Validate credentials
if ([string]::IsNullOrEmpty($SupabaseUrl) -or [string]::IsNullOrEmpty($SupabaseAnonKey)) {
    Write-Error-Custom "Missing required environment variables!"
    Write-Info "Please set SUPABASE_URL and SUPABASE_ANON_KEY"
    Write-Info "Example:"
    Write-Host '  $env:SUPABASE_URL="https://gfmhhnynyxvmekhvytgg.supabase.co"' -ForegroundColor Yellow
    Write-Host '  $env:SUPABASE_ANON_KEY="your-anon-key"' -ForegroundColor Yellow
    exit 1
}

# Test data
$testData = @{
    courseSlug = "test-course-slug"
    courseTitle = "Test Course Title"
    price = 99.99
    voucherCode = $null
    email = "test@example.com"
    name = "Test User"
} | ConvertTo-Json

Write-Host "`n████████████████████████████████████████████████████████████" -ForegroundColor Cyan
Write-Host "  PayPal Payment Endpoints Test Suite" -ForegroundColor Cyan
Write-Host "████████████████████████████████████████████████████████████`n" -ForegroundColor Cyan

Write-Info "Supabase URL: $SupabaseUrl"
Write-Info "Testing with email: test@example.com`n"

# Test 1: Create PayPal Order
Write-Section "TEST 1: Create PayPal Order"

Write-Info "Sending request to create-paypal-order endpoint..."
Write-Info "Course: Test Course Title"
Write-Info "Price: £99.99"
Write-Info "Email: test@example.com"

try {
    $headers = @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $SupabaseAnonKey"
    }
    
    $response = Invoke-WebRequest `
        -Uri "$SupabaseUrl/functions/v1/create-paypal-order" `
        -Method POST `
        -Headers $headers `
        -Body $testData `
        -UseBasicParsing
    
    $result = $response.Content | ConvertFrom-Json
    
    Write-Success "PayPal order created successfully!"
    Write-Host "`nResponse Data:" -ForegroundColor White
    Write-Host ($result | ConvertTo-Json -Depth 10) -ForegroundColor Gray
    
    if ($result.approvalUrl) {
        Write-Info "`nApproval URL (use this to complete payment in sandbox):"
        Write-Host $result.approvalUrl -ForegroundColor Blue
        Write-Warning-Custom "`nNote: You need to log in to PayPal Sandbox to complete the payment"
        Write-Warning-Custom "Visit: https://www.sandbox.paypal.com/"
    }
    
    $orderId = $result.orderId
    $paymentIntentId = $result.paymentIntentId
    
    # Test 2: Simulate PayPal Webhook
    Write-Host "`nWaiting 2 seconds before webhook test..." -ForegroundColor Cyan
    Start-Sleep -Seconds 2
    
    Write-Section "TEST 2: Simulate PayPal Webhook"
    
    Write-Info "Sending simulated webhook event..."
    Write-Info "Order ID: $orderId"
    Write-Info "Payment Intent ID: $paymentIntentId"
    
    $webhookEvent = @{
        event_type = "PAYMENT.CAPTURE.COMPLETED"
        resource = @{
            id = $orderId
            status = "COMPLETED"
            amount = @{
                currency_code = "GBP"
                value = "99.99"
            }
        }
    } | ConvertTo-Json -Depth 10
    
    $webhookResponse = Invoke-WebRequest `
        -Uri "$SupabaseUrl/functions/v1/paypal-webhook" `
        -Method POST `
        -Headers $headers `
        -Body $webhookEvent `
        -UseBasicParsing
    
    $webhookResult = $webhookResponse.Content | ConvertFrom-Json
    
    Write-Success "Webhook processed successfully!"
    Write-Host "`nResponse Data:" -ForegroundColor White
    Write-Host ($webhookResult | ConvertTo-Json -Depth 10) -ForegroundColor Gray
    
    Write-Info "`nCheck your database for:"
    Write-Info "1. Updated payment_intents record (status: completed)"
    Write-Info "2. New enrollments record"
    Write-Info "3. Confirmation email sent to test@example.com"
    
    # Summary
    Write-Section "TEST SUMMARY"
    Write-Success "✓ Create PayPal Order: PASSED"
    Write-Success "✓ PayPal Webhook: PASSED"
    Write-Host "`n============================================================`n" -ForegroundColor Cyan
    Write-Success "🎉 All tests passed!"
    Write-Host ""
    
} catch {
    Write-Error-Custom "Test failed: $($_.Exception.Message)"
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "`nError Response:" -ForegroundColor Red
        Write-Host $responseBody -ForegroundColor Gray
    }
    
    Write-Host "`n============================================================`n" -ForegroundColor Cyan
    Write-Warning-Custom "⚠ Tests failed. Check the output above for details."
    Write-Host ""
    
    Write-Warning-Custom "`nPlease check:"
    Write-Warning-Custom "1. PAYPAL_CLIENT_ID is set in Supabase secrets"
    Write-Warning-Custom "2. PAYPAL_CLIENT_SECRET is set in Supabase secrets"
    Write-Warning-Custom "3. PAYPAL_ENVIRONMENT is set (sandbox or production)"
    Write-Warning-Custom "4. payment_intents table exists in your database"
    
    exit 1
}
