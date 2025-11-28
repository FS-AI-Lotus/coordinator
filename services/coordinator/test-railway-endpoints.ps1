# Test script for Railway deployment
# Run: .\test-railway-endpoints.ps1

$baseUrl = "https://coordinator-production-e0a0.up.railway.app"

Write-Host "🧪 Testing Railway Coordinator Service" -ForegroundColor Cyan
Write-Host "Base URL: $baseUrl" -ForegroundColor Gray
Write-Host ""

# Test 1: GET /health
Write-Host "Test 1: GET /health" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/health" -Method GET
    Write-Host "✅ Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "   Content: $($response.Content)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
}
Write-Host ""

# Test 2: GET /register
Write-Host "Test 2: GET /register" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/register" -Method GET
    Write-Host "✅ Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "   Content: $($response.Content)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
}
Write-Host ""

# Test 3: POST /register
Write-Host "Test 3: POST /register" -ForegroundColor Yellow
$body = @{
    name = "rag"
    url = "https://ragmicroservice.up.railway.app"
    grpc = 50052
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/register" -Method POST -Body $body -ContentType "application/json"
    Write-Host "✅ Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "   Content: $($response.Content)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "   Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    }
}
Write-Host ""

# Test 4: GET / (root)
Write-Host "Test 4: GET / (root)" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/" -Method GET
    Write-Host "✅ Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "   Content: $($response.Content)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
}
Write-Host ""

Write-Host "=" * 50 -ForegroundColor Cyan
Write-Host "Tests completed!" -ForegroundColor Cyan

