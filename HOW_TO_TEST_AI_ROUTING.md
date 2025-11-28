# 🤖 How to Check/Test AI Routing

## ⚠️ Current Issue

**Problem:** All services are in `pending_migration` status.  
**Solution:** AI routing requires at least one `active` service.

---

## ✅ Step 1: Activate a Service

To test AI routing, you need at least one service with `active` status.

### Option A: Register a Service with Migration File

```powershell
$baseUrl = "https://coordinator-production-e0a0.up.railway.app"
$headers = @{"Content-Type" = "application/json"}

$service = @{
    serviceName = "user-service"
    version = "1.0.0"
    endpoint = "https://user-service.railway.app"
    healthCheck = "/health"
    migrationFile = @{
        schema = "v1"
        tables = @("users", "profiles")
        description = "User management service"
    }
} | ConvertTo-Json

Invoke-RestMethod -Uri "$baseUrl/register" -Method Post -Headers $headers -Body $service
```

### Option B: Add Migration to Existing Service

```powershell
# First, get service ID
$services = Invoke-RestMethod -Uri "$baseUrl/services"
$serviceId = ($services.services | Where-Object { $_.serviceName -eq "my-microservice1" }).serviceId

# Add migration file
$migration = @{
    schema = "v1"
    tables = @("users", "profiles")
    description = "User management"
} | ConvertTo-Json

Invoke-RestMethod -Uri "$baseUrl/register/$serviceId/migration" `
    -Method Post `
    -Headers $headers `
    -Body $migration
```

---

## 🧪 Step 2: Test AI Routing

### Method 1: GET Request (Simple)

```powershell
# Simple query
Invoke-RestMethod -Uri "https://coordinator-production-e0a0.up.railway.app/route?q=get user profile" | ConvertTo-Json -Depth 10

# Or in browser:
# https://coordinator-production-e0a0.up.railway.app/route?q=get user profile
```

### Method 2: POST Request (Advanced)

```powershell
$body = @{
    query = "I need to get user profile information"
    method = "GET"
    path = "/users/123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://coordinator-production-e0a0.up.railway.app/route" `
    -Method Post `
    -Headers @{"Content-Type" = "application/json"} `
    -Body $body | ConvertTo-Json -Depth 10
```

---

## 📋 Expected Response

**Success (AI Routing):**
```json
{
  "success": true,
  "primaryTarget": {
    "serviceName": "user-service",
    "endpoint": "https://user-service.railway.app",
    "confidence": 0.95,
    "reasoning": "This service handles user management operations"
  },
  "targetServices": [...],
  "totalCandidates": 1,
  "routingMethod": "ai",
  "processingTime": 1234
}
```

**Success (Fallback Routing):**
```json
{
  "success": true,
  "primaryTarget": {
    "serviceName": "my-service",
    "endpoint": "http://my-service:3000",
    "confidence": 0.6,
    "reasoning": "Keyword match"
  },
  "routingMethod": "fallback",
  "processingTime": 50
}
```

**Error (No Active Services):**
```json
{
  "success": false,
  "message": "No active services available for routing"
}
```

---

## 🔍 Check AI Routing Configuration

### Verify Environment Variables in Railway:

1. Go to Railway Dashboard → Coordinator Service → **Variables**
2. Check:
   - `AI_ROUTING_ENABLED=true` ✅
   - `OPENAI_API_KEY=sk-...` ✅
   - `AI_MODEL=gpt-4o-mini` (optional)

### Check Logs:

Look for in Railway logs:
- ✅ `"AI Routing Service initialized with OpenAI"` → AI is enabled
- ❌ `"AI Routing Service initialized without OpenAI"` → AI is disabled

---

## 🧪 Quick Test Commands

### Test 1: Simple Query
```powershell
Invoke-RestMethod -Uri "https://coordinator-production-e0a0.up.railway.app/route?q=get user profile"
```

### Test 2: User Creation Query
```powershell
$body = @{query="create new user account"} | ConvertTo-Json
Invoke-RestMethod -Uri "https://coordinator-production-e0a0.up.railway.app/route" -Method Post -Headers @{"Content-Type"="application/json"} -Body $body
```

### Test 3: Payment Query
```powershell
Invoke-RestMethod -Uri "https://coordinator-production-e0a0.up.railway.app/route?q=process payment"
```

---

## 🐛 Troubleshooting

### Issue: "No active services available"
**Cause:** All services are `pending_migration`  
**Fix:** Activate at least one service (see Step 1)

### Issue: Using fallback instead of AI
**Causes:**
- `AI_ROUTING_ENABLED` not set to `true`
- `OPENAI_API_KEY` missing or invalid
- OpenAI API error

**Fix:**
1. Check Railway environment variables
2. Verify OpenAI API key is valid
3. Check Railway logs for errors

### Issue: 500 Internal Server Error
**Causes:**
- No active services
- OpenAI API error
- Service registry error

**Fix:**
1. Activate at least one service
2. Check Railway logs for detailed error
3. Verify all environment variables are set

---

## 📊 Response Fields Explained

- **`routingMethod`**: `"ai"` or `"fallback"` - Which method was used
- **`primaryTarget`**: The selected service
  - `serviceName`: Name of the service
  - `endpoint`: Service URL
  - `confidence`: 0.0-1.0 (higher = better match)
  - `reasoning`: Why this service was selected
- **`targetServices`**: Array of all candidate services
- **`totalCandidates`**: Number of services considered
- **`processingTime`**: Time taken in milliseconds

---

**Next Step:** Activate at least one service, then test AI routing! 🚀

