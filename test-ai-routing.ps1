# Test AI Routing Functionality
# This script tests the AI routing endpoint with various queries

$baseUrl = "https://coordinator-production-e0a0.up.railway.app"
$headers = @{
    "Content-Type" = "application/json"
}

Write-Host "=== Testing AI Routing ===" -ForegroundColor Cyan
Write-Host ""

# Test 1: Simple GET request
Write-Host "Test 1: GET /route?q=get user profile" -ForegroundColor Yellow
try {
    $response1 = Invoke-RestMethod -Uri "$baseUrl/route?q=get user profile"
    Write-Host "✅ Success" -ForegroundColor Green
    Write-Host "Routing Method: $($response1.routingMethod)" -ForegroundColor Cyan
    Write-Host "Primary Target: $($response1.primaryTarget.serviceName)" -ForegroundColor Cyan
    Write-Host "Confidence: $($response1.primaryTarget.confidence)" -ForegroundColor Cyan
    Write-Host "Processing Time: $($response1.processingTime)ms" -ForegroundColor Cyan
    $response1 | ConvertTo-Json -Depth 5
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n" -NoNewline

# Test 2: POST request with full context
Write-Host "Test 2: POST /route (with context)" -ForegroundColor Yellow
$body2 = @{
    query = "I need to create a new user account"
    method = "POST"
    path = "/users"
    metadata = @{
        action = "create"
        resource = "user"
    }
} | ConvertTo-Json

try {
    $response2 = Invoke-RestMethod -Uri "$baseUrl/route" -Method Post -Headers $headers -Body $body2
    Write-Host "✅ Success" -ForegroundColor Green
    Write-Host "Routing Method: $($response2.routingMethod)" -ForegroundColor Cyan
    Write-Host "Primary Target: $($response2.primaryTarget.serviceName)" -ForegroundColor Cyan
    Write-Host "Confidence: $($response2.primaryTarget.confidence)" -ForegroundColor Cyan
    Write-Host "Reasoning: $($response2.primaryTarget.reasoning)" -ForegroundColor Gray
    $response2 | ConvertTo-Json -Depth 5
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n" -NoNewline

# Test 3: Different query
Write-Host "Test 3: GET /route?q=process payment" -ForegroundColor Yellow
try {
    $response3 = Invoke-RestMethod -Uri "$baseUrl/route?q=process payment"
    Write-Host "✅ Success" -ForegroundColor Green
    Write-Host "Routing Method: $($response3.routingMethod)" -ForegroundColor Cyan
    Write-Host "Primary Target: $($response3.primaryTarget.serviceName)" -ForegroundColor Cyan
    Write-Host "Confidence: $($response3.primaryTarget.confidence)" -ForegroundColor Cyan
    $response3 | ConvertTo-Json -Depth 5
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n" -NoNewline

# Test 4: Check routing with intent
Write-Host "Test 4: POST /route (with intent)" -ForegroundColor Yellow
$body4 = @{
    intent = "I want to update my user profile information"
    method = "PUT"
    path = "/users/me"
} | ConvertTo-Json

try {
    $response4 = Invoke-RestMethod -Uri "$baseUrl/route" -Method Post -Headers $headers -Body $body4
    Write-Host "✅ Success" -ForegroundColor Green
    Write-Host "Routing Method: $($response4.routingMethod)" -ForegroundColor Cyan
    Write-Host "Primary Target: $($response4.primaryTarget.serviceName)" -ForegroundColor Cyan
    Write-Host "Confidence: $($response4.primaryTarget.confidence)" -ForegroundColor Cyan
    $response4 | ConvertTo-Json -Depth 5
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Cyan

