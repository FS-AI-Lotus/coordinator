# Register 4 Microservices to Coordinator
# Run this script to register all services

$baseUrl = "https://coordinator-production-e0a0.up.railway.app"
$headers = @{
    "Content-Type" = "application/json"
}

Write-Host "=== Registering 4 Microservices ===" -ForegroundColor Cyan
Write-Host ""

# Service 1: my-microservice1 (with migration file)
Write-Host "Registering: my-microservice1" -ForegroundColor Yellow
$service1 = @{
    name = "my-microservice1"
    url = "https://my-service.railway.app"
    grpc = $false
} | ConvertTo-Json

try {
    $response1 = Invoke-RestMethod -Uri "$baseUrl/register" -Method Post -Headers $headers -Body $service1
    Write-Host "✅ Registered: my-microservice1" -ForegroundColor Green
    $response1 | ConvertTo-Json -Depth 5
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host $_.ErrorDetails.Message -ForegroundColor Red
    }
}

Write-Host ""

# Service 2: my-service
Write-Host "Registering: my-service" -ForegroundColor Yellow
$service2 = @{
    name = "my-service"
    url = "http://my-service:3000"
    grpc = $false
} | ConvertTo-Json

try {
    $response2 = Invoke-RestMethod -Uri "$baseUrl/register" -Method Post -Headers $headers -Body $service2
    Write-Host "✅ Registered: my-service" -ForegroundColor Green
    $response2 | ConvertTo-Json -Depth 5
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host $_.ErrorDetails.Message -ForegroundColor Red
    }
}

Write-Host ""

# Service 3: test-service-1
Write-Host "Registering: test-service-1" -ForegroundColor Yellow
$service3 = @{
    name = "test-service-1"
    url = "http://localhost:3001"
    grpc = $false
} | ConvertTo-Json

try {
    $response3 = Invoke-RestMethod -Uri "$baseUrl/register" -Method Post -Headers $headers -Body $service3
    Write-Host "✅ Registered: test-service-1" -ForegroundColor Green
    $response3 | ConvertTo-Json -Depth 5
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host $_.ErrorDetails.Message -ForegroundColor Red
    }
}

Write-Host ""

# Service 4: test-service-2
Write-Host "Registering: test-service-2" -ForegroundColor Yellow
$service4 = @{
    name = "test-service-2"
    url = "http://localhost:3002"
    grpc = $false
} | ConvertTo-Json

try {
    $response4 = Invoke-RestMethod -Uri "$baseUrl/register" -Method Post -Headers $headers -Body $service4
    Write-Host "✅ Registered: test-service-2" -ForegroundColor Green
    $response4 | ConvertTo-Json -Depth 5
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host $_.ErrorDetails.Message -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== Registration Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Verifying registered services..." -ForegroundColor Yellow

# Verify registration
try {
    $allServices = Invoke-RestMethod -Uri "$baseUrl/services"
    Write-Host "Total services registered: $($allServices.total)" -ForegroundColor Green
    $allServices.services | ForEach-Object {
        Write-Host "  - $($_.serviceName) ($($_.status))" -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ Failed to verify: $($_.Exception.Message)" -ForegroundColor Red
}


