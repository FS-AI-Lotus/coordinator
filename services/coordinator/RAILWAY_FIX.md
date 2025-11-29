# Railway Container Start Fix

## Problem

Container failed to start with error:
```
The executable `cd` could not be found.
```

## Root Cause

The `railway.json` file had commands using `cd`, which doesn't work in the container context. Railway was trying to execute:
- `cd services/coordinator && npm start` (start command)
- `cd services/coordinator && node scripts/test-deployment.js` (postDeploy)

## Solution

Removed the `cd` commands from `railway.json` because:

1. **Dockerfile already sets WORKDIR**: The Dockerfile sets `WORKDIR /app`, so we're already in the correct directory
2. **Dockerfile CMD is correct**: The Dockerfile uses `CMD ["node", "src/index.js"]` which is the correct start command
3. **No need for cd**: Railway should use the Dockerfile's CMD directly

## Updated Configuration

**Before:**
```json
{
  "deploy": {
    "startCommand": "cd services/coordinator && npm start",
    ...
  },
  "postDeploy": {
    "command": "cd services/coordinator && node scripts/test-deployment.js"
  }
}
```

**After:**
```json
{
  "deploy": {
    "healthcheckPath": "/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

## Why This Works

- Railway will use the Dockerfile's `CMD` directive: `node src/index.js`
- The Dockerfile already sets `WORKDIR /app`
- All files are copied to `/app` in the container
- No need for `cd` commands

## Post-Deploy Testing

If you want to run tests after deployment, you can:

1. **Use Railway's webhook** to trigger tests externally
2. **Run tests manually** after deployment: `npm run test:deployment`
3. **Use GitHub Actions** (already configured in `.github/workflows/test-deployment.yml`)

## Next Steps

1. ✅ `railway.json` updated (removed `cd` commands)
2. ✅ Push changes to trigger rebuild
3. ✅ Container should start successfully
4. ✅ Verify service is running

---

**Note:** The Dockerfile's CMD is the source of truth for how the container starts. Railway will use it automatically.

