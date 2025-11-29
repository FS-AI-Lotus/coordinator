# Run Deployment Tests - Quick Guide

## Deployment Completed! ✅

Now let's test the live Railway instance.

---

## Option 1: Run in WSL (Recommended)

If you have WSL, use it:

```bash
cd services/coordinator
npm run test:deployment
```

---

## Option 2: Run with Node Directly

```bash
cd services/coordinator
node run-deployment-tests.js
```

---

## Option 3: Run Jest Directly

```bash
cd services/coordinator
npx jest tests/deployment.test.js --testTimeout=30000
```

---

## Option 4: Manual Test (Quick Check)

Test the health endpoint:

```bash
curl https://coordinator-production-e0a0.up.railway.app/health
```

Or test the unified proxy endpoint:

```bash
curl -X POST https://coordinator-production-e0a0.up.railway.app/api/fill-content-metrics/ \
  -H "Content-Type: application/json" \
  -d '{
    "requester_service": "test",
    "payload": {},
    "response": {"answer": ""}
  }'
```

---

## Expected Test Results

The deployment tests will verify:

✅ Service health and accessibility  
✅ Unified proxy endpoint (`/api/fill-content-metrics/`)  
✅ Request validation  
✅ Error handling  
✅ Service discovery endpoints  
✅ Response times  

---

## If Tests Fail

1. **Check Railway Dashboard**
   - Verify service is running
   - Check logs for errors

2. **Verify Service URL**
   - https://coordinator-production-e0a0.up.railway.app/health
   - Should return: `{"status":"healthy",...}`

3. **Check Network**
   - Ensure Railway URL is accessible
   - Verify no firewall blocking

---

**Ready to test?** Choose one of the options above!

