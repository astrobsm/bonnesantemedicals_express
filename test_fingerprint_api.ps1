# Test script for fingerprint API endpoints
Write-Host "🔐 Testing AstroBSM Fingerprint Integration" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:8080/api/v1/fingerprint"

# Test 1: Check scanner status
Write-Host "Test 1: Scanner Status" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/status" -Method Get -ContentType "application/json"
    Write-Host "✅ Status endpoint works!" -ForegroundColor Green
    Write-Host "Scanner Available: $($response.scanner_available)" -ForegroundColor White
    Write-Host "Message: $($response.message)" -ForegroundColor White
} catch {
    Write-Host "❌ Status endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 2: Enroll a fingerprint
Write-Host "Test 2: Fingerprint Enrollment" -ForegroundColor Yellow
try {
    $enrollData = @{
        user_id = 1
        user_name = "Test User"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$baseUrl/enroll" -Method Post -Body $enrollData -ContentType "application/json"
    Write-Host "✅ Enrollment endpoint works!" -ForegroundColor Green
    Write-Host "User: $($response.user_name)" -ForegroundColor White
    Write-Host "Template ID: $($response.template_id)" -ForegroundColor White
    Write-Host "Success: $($response.success)" -ForegroundColor White
} catch {
    Write-Host "❌ Enrollment endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Red
    }
}
Write-Host ""

# Test 3: Verify fingerprint (clock in/out)
Write-Host "Test 3: Fingerprint Verification" -ForegroundColor Yellow
try {
    $verifyData = @{} | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$baseUrl/verify" -Method Post -Body $verifyData -ContentType "application/json"
    Write-Host "✅ Verification endpoint works!" -ForegroundColor Green
    Write-Host "User: $($response.user_name)" -ForegroundColor White
    Write-Host "Action: $($response.action_type)" -ForegroundColor White
    Write-Host "Timestamp: $($response.timestamp)" -ForegroundColor White
} catch {
    Write-Host "❌ Verification endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Red
    }
}
Write-Host ""

# Test 4: List templates
Write-Host "Test 4: List Templates" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/templates" -Method Get -ContentType "application/json"
    Write-Host "✅ Templates endpoint works!" -ForegroundColor Green
    Write-Host "Template count: $($response.templates.Count)" -ForegroundColor White
    
    if ($response.templates.Count -gt 0) {
        Write-Host "Templates:" -ForegroundColor White
        foreach ($template in $response.templates) {
            Write-Host "  - ID: $($template.id), User: $($template.user_name), UserID: $($template.user_id)" -ForegroundColor Gray
        }
    } else {
        Write-Host "No templates found" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Templates endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

Write-Host "🎉 Fingerprint Integration Test Complete!" -ForegroundColor Green
Write-Host "📄 Open http://localhost:8080/static/fingerprint_test.html for interactive testing" -ForegroundColor Cyan
Write-Host "📚 API Documentation: http://localhost:8080/docs" -ForegroundColor Cyan
