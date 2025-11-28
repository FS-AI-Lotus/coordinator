# 🔧 Railway Deployment Issue Fix

## Problem
Railway logs show:
```
UI/UX coordinator config service listening on port 8080
```

But the expected log should be:
```
Coordinator HTTP server started { port: 8080, environment: 'production' }
```

This suggests Railway is **not using the Dockerfile** and is auto-detecting the wrong entry point.

---

## Solution: Force Railway to Use Dockerfile

### Option 1: Set Build Command in Railway (Recommended)

1. Go to Railway Dashboard → Your Project → Coordinator Service
2. Click on **Settings** tab
3. Scroll to **Build & Deploy** section
4. Set **Build Command** to:
   ```
   docker build -t coordinator .
   ```
5. Set **Start Command** to:
   ```
   docker run coordinator
   ```
   OR leave it empty (Railway will use Dockerfile CMD)

### Option 2: Create `railway.json` (Alternative)

Create a `railway.json` file in `services/coordinator/`:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"
  },
  "deploy": {
    "startCommand": "node src/index.js",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Option 3: Verify Dockerfile is Being Used

1. In Railway Dashboard → Coordinator Service → Settings
2. Check **Build Settings**
3. Ensure **Dockerfile Path** is set to: `services/coordinator/Dockerfile`
   - If deploying from root, it should be: `Dockerfile` (if Dockerfile is in root)
   - If deploying from `services/coordinator/`, it should be: `Dockerfile`

---

## Verify Correct Service is Running

After fixing, you should see these logs:

```
Coordinator HTTP server started { port: 8080, environment: 'production' }
Both HTTP and gRPC servers are running { httpPort: 8080, grpcPort: 50051 }
```

### Test Endpoints

Once the correct service is running, test:

```bash
# Health check
curl https://your-service.railway.app/health

# Should return:
# { "status": "ok", "service": "coordinator" }

# Root endpoint
curl https://your-service.railway.app/

# Should return service info with all endpoints
```

---

## Common Issues

### Issue: Railway Auto-Detecting Wrong Entry Point
**Symptom:** Wrong log messages, service not working correctly  
**Fix:** Explicitly set Dockerfile path in Railway settings

### Issue: Port Mismatch
**Symptom:** Service starts but can't connect  
**Fix:** Railway sets PORT automatically (8080), ensure your code uses `process.env.PORT`

### Issue: Missing Environment Variables
**Symptom:** Service starts but features don't work  
**Fix:** Set all required env vars (see `RAILWAY_ENV_CHECKLIST.md`)

---

## Quick Checklist

- [ ] Railway is using Dockerfile (check Build Settings)
- [ ] Dockerfile CMD is `node src/index.js` ✅ (already correct)
- [ ] PORT environment variable is set (Railway auto-sets this)
- [ ] NODE_ENV=production is set
- [ ] Service logs show "Coordinator HTTP server started"
- [ ] Health endpoint `/health` returns 200 OK

---

## Expected Logs After Fix

```
Coordinator HTTP server started { port: 8080, environment: 'production' }
Both HTTP and gRPC servers are running { httpPort: 8080, grpcPort: 50051 }
```

If you see "UI/UX coordinator config service", Railway is running the wrong file (likely `server.js` instead of `src/index.js`).

