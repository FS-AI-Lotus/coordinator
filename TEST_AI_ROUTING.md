# 🤖 How to Test AI Routing

AI routing uses OpenAI to intelligently route requests to the appropriate microservice.

---

## ✅ Prerequisites

1. **AI Routing Enabled:**
   - `AI_ROUTING_ENABLED=true` in Railway environment variables
   - `OPENAI_API_KEY` set in Railway environment variables

2. **Services Registered:**
   - At least one service registered in the coordinator
   - Services should be `active` status (not `pending_migration`)

---

## 🧪 Testing Methods

### **Method 1: GET Request (Simple Query)**

**Endpoint:** `GET /route?q=YOUR_QUERY`

**Example:**
```bash
# PowerShell
Invoke-RestMethod -Uri "https://coordinator-production-e0a0.up.railway.app/route?q=get user profile" | ConvertTo-Json -Depth 10

# curl
curl "https://coordinator-production-e0a0.up.railway.app/route?q=get user profile"
```

**Browser:**
```
https://coordinator-production-e0a0.up.railway.app/route?q=get user profile
```

---

### **Method 2: POST Request (Advanced)**

**Endpoint:** `POST /route`

**Request Body:**
```json
{
  "query": "get user profile",
  "method": "GET",
  "path": "/users/123",
  "metadata": {
    "userId": "123"
  }
}
```

**PowerShell:**
```powershell
$body = @{
    query = "get user profile"
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

**Success Response:**
```json
{
  "success": true,
  "primaryTarget": {
    "serviceName": "my-microservice1",
    "endpoint": "https://my-service.railway.app",
    "confidence": 0.95,
    "reasoning": "This service handles user management"
  },
  "targetServices": [
    {
      "serviceName": "my-microservice1",
      "endpoint": "https://my-service.railway.app",
      "confidence": 0.95,
      "reasoning": "..."
    }
  ],
  "totalCandidates": 4,
  "routingMethod": "ai",
  "processingTime": 1234
}
```

**Fallback Response (if AI fails):**
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

---

## 🧪 Test Queries

Try these queries to test AI routing:

1. **User-related:**
   - `"get user profile"`
   - `"create new user account"`
   - `"update user information"`

2. **Service-specific:**
   - `"handle payment processing"`
   - `"process order"`
   - `"send notification"`

3. **General:**
   - `"what service handles users?"`
   - `"route this to user service"`

---

## 🔍 Check AI Routing Status

**Check if AI routing is enabled:**
```powershell
# Check health endpoint (shows AI status in logs)
Invoke-RestMethod -Uri "https://coordinator-production-e0a0.up.railway.app/health" | ConvertTo-Json
```

**Check Railway logs:**
- Look for: `"AI Routing Service initialized with OpenAI"`
- If you see: `"AI Routing Service initialized without OpenAI"` → AI is disabled

---

## 🐛 Troubleshooting

### Issue: "No suitable service found"
**Cause:** No active services registered
**Fix:** Register services and ensure they're `active` status

### Issue: Using fallback routing instead of AI
**Causes:**
- `AI_ROUTING_ENABLED` not set to `true`
- `OPENAI_API_KEY` not set or invalid
- OpenAI API error

**Fix:**
1. Check Railway environment variables
2. Verify `OPENAI_API_KEY` is valid
3. Check Railway logs for OpenAI errors

### Issue: AI routing returns low confidence
**Cause:** Query doesn't match any service well
**Fix:** Try more specific queries or register more services

---

## 📊 Example Test Script

See `test-ai-routing.ps1` for automated testing.

