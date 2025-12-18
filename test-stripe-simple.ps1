
$url = "https://bzxzsidcifkhedydujqb.supabase.co/functions/v1/create-checkout-session"
$body = @{
    courseSlug = "test-course-manual"
    courseTitle = "Manual Test Course"
    price = 25.00
    userEmail = "manual-test@example.com"
} | ConvertTo-Json

Write-Host "Sending request to: $url"
try {
    $response = Invoke-RestMethod -Uri $url -Method Post -Body $body -ContentType "application/json" -Headers @{ "Origin" = "http://localhost:3000" }
    $response.url | Out-File -FilePath "payment_url.txt" -Encoding utf8
    Write-Host "URL saved to payment_url.txt"
} catch {
    Write-Host "Error calling function:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    $streamReader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
    $errBody = $streamReader.ReadToEnd()
    Write-Host "Response Body: $errBody"
}
