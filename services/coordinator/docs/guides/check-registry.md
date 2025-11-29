# 🔍 How to Check Microservice Registry

Your coordinator is running successfully! Here's how to check the registry.

---

## 🌐 Get Your Railway Service URL

First, get your Railway service URL:
1. Go to Railway Dashboard → Coordinator Service
2. Click on the service
3. Find the **Domain** or **Public URL** (e.g., `https://coordinator-production-xxxx.up.railway.app`)

Or check the **Settings** → **Networking** tab for the public domain.

---

## 📋 Registry Endpoints

### **1. Get All Registered Services**

**Endpoint:** `GET /services` or `GET /registry`

```bash
# Replace YOUR_RAILWAY_URL with your actual Railway URL
curl https://YOUR_RAILWAY_URL/services

# Or using the alias
curl https://YOUR_RAILWAY_URL/registry
```

**Expected Response:**
```json
{
  "success": true,
  "services": [
    {
      "serviceName": "ms1",
      "version": "1.0.0",
      "endpoint": "http://ms1:3000",
      "status": "active",
      "healthCheck": "/health",
      "registeredAt": "2025-11-28T19:45:00.000Z"
    },
    // ... more services
  ],
  "total": 4
}
```

### **2. Check Service Health**

**Endpoint:** `GET /health`

```bash
curl https://YOUR_RAILWAY_URL/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "service": "coordinator",
  "timestamp": "2025-11-28T19:51:32.000Z",
  "uptime": 12345,
  "services": {
    "total": 4,
    "active": 4
  }
}
```

### **3. View Knowledge Graph**

**Endpoint:** `GET /knowledge-graph` or `GET /graph`

```bash
curl https://YOUR_RAILWAY_URL/knowledge-graph
```

**Expected Response:**
```json
{
  "metadata": {
    "totalServices": 4,
    "activeServices": 4,
    "lastUpdated": "2025-11-28T19:51:34.000Z",
    "version": 54
  },
  "nodes": [
    {
      "id": "uuid-here",
      "label": "ms1",
      "type": "microservice",
      "data": {
        "serviceName": "ms1",
        "version": "1.0.0",
        "endpoint": "http://ms1:3000",
        "status": "active"
      }
    }
    // ... more nodes
  ],
  "edges": [],
  "schemas": {},
  "relationships": []
}
```

### **4. Get Root Service Info**

**Endpoint:** `GET /`

```bash
curl https://YOUR_RAILWAY_URL/
```

**Expected Response:**
```json
{
  "service": "Coordinator Microservice",
  "version": "1.0.0",
  "status": "running",
  "endpoints": {
    "register": "POST /register, POST /register/:serviceId/migration",
    "route": "GET /route, POST /route (AI-based routing)",
    "knowledgeGraph": "GET /knowledge-graph, GET /graph, POST /knowledge-graph/rebuild",
    "uiux": "GET /uiux, POST /uiux",
    "services": "GET /services, GET /registry",
    "changelog": "GET /changelog, GET /changelog/stats, GET /changelog/search, POST /changelog/cleanup",
    "schemas": "GET /schemas, GET /schemas/:serviceId, POST /schemas/:serviceId/validate",
    "health": "GET /health",
    "metrics": "GET /metrics",
    "proxy": "All other routes are proxied through AI routing"
  }
}
```

### **5. View Metrics**

**Endpoint:** `GET /metrics`

```bash
curl https://YOUR_RAILWAY_URL/metrics
```

---

## 🧪 Quick Test Commands

### **Using PowerShell (Windows):**

```powershell
# Replace with your Railway URL
$RAILWAY_URL = "https://coordinator-production-xxxx.up.railway.app"

# Get all services
Invoke-RestMethod -Uri "$RAILWAY_URL/services" -Method Get

# Check health
Invoke-RestMethod -Uri "$RAILWAY_URL/health" -Method Get

# Get knowledge graph
Invoke-RestMethod -Uri "$RAILWAY_URL/knowledge-graph" -Method Get
```

### **Using curl (Linux/Mac/Git Bash):**

```bash
# Replace with your Railway URL
RAILWAY_URL="https://coordinator-production-xxxx.up.railway.app"

# Get all services
curl $RAILWAY_URL/services

# Check health
curl $RAILWAY_URL/health

# Get knowledge graph
curl $RAILWAY_URL/knowledge-graph
```

### **Using Browser:**

Just open these URLs in your browser:
- `https://YOUR_RAILWAY_URL/services`
- `https://YOUR_RAILWAY_URL/health`
- `https://YOUR_RAILWAY_URL/knowledge-graph`

---

## 📝 Register a New Microservice

If you want to register a new microservice:

```bash
curl -X POST https://YOUR_RAILWAY_URL/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "my-service",
    "url": "http://my-service:3000",
    "grpc": false
  }'
```

Or full format:
```bash
curl -X POST https://YOUR_RAILWAY_URL/register \
  -H "Content-Type: application/json" \
  -d '{
    "serviceName": "my-service",
    "version": "1.0.0",
    "endpoint": "http://my-service:3000",
    "healthCheck": "/health",
    "description": "My microservice"
  }'
```

---

## 🔍 What You Should See

Based on your logs, you have **4 services** registered. When you call `/services`, you should see all 4 services listed.

The knowledge graph shows:
- **Version:** 54
- **Total Services:** 4
- **All services are active**

---

## 🐛 Troubleshooting

### **Issue: Connection refused / Timeout**

**Solution:**
- Check that your Railway service is running (check logs)
- Verify the URL is correct
- Check Railway networking settings (service should be public)

### **Issue: 404 Not Found**

**Solution:**
- Make sure you're using the correct endpoint (`/services` not `/service`)
- Check that the service is deployed and running

### **Issue: Empty services array**

**Solution:**
- Services might be in Supabase but not showing
- Check Supabase connection in Railway environment variables
- Try rebuilding knowledge graph: `POST /knowledge-graph/rebuild`

---

**Your coordinator is ready!** 🚀


