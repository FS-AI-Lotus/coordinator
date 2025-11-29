# Quick Start - Deployment Tests

## 🚀 Test Your Railway Deployment

### Railway URL
**https://coordinator-production-e0a0.up.railway.app**

---

## Run Tests Now

### Option 1: Run Deployment Tests

```bash
cd services/coordinator
npm run test:deployment
```

### Option 2: Run All Tests (Unit + Deployment)

```bash
cd services/coordinator
npm run test:all
```

### Option 3: Manual Test Script

```bash
cd services/coordinator
node scripts/test-deployment.js
```

---

## What Gets Tested

✅ Service health and accessibility  
✅ Unified proxy endpoint (`/api/fill-content-metrics/`)  
✅ Request validation  
✅ Error handling  
✅ Service discovery endpoints  
✅ Response times  

---

## Expected Output

```
🚀 Post-Deployment Test Script
============================================================
📍 Testing against: https://coordinator-production-e0a0.up.railway.app

🔍 Checking service health...
✅ Service is healthy and accessible

🧪 Running deployment tests...

PASS tests/deployment.test.js
  Deployment Tests - Railway Instance
    ✓ should respond to root endpoint
    ✓ should respond to health endpoint
    ✓ should reject request without requester_service
    ...

✅ Deployment tests passed!
```

---

## Troubleshooting

### If Tests Fail

1. **Check Railway Service**
   - Visit: https://coordinator-production-e0a0.up.railway.app/health
   - Should return: `{"status":"healthy",...}`

2. **Check Network**
   ```bash
   curl https://coordinator-production-e0a0.up.railway.app/health
   ```

3. **Verify Service is Deployed**
   - Check Railway dashboard
   - Verify service is running

---

## Next Steps

1. ✅ Run tests: `npm run test:deployment`
2. ✅ Review results
3. ✅ Fix any issues
4. ✅ Re-run tests

---

**Ready to test?** Run: `npm run test:deployment`

