# 🔧 Railway Dockerfile Not Found - Fix Guide

## Problem
```
Dockerfile `Dockerfile` does not exist
```

## Root Cause
Railway cannot find the Dockerfile even though it exists at `services/coordinator/Dockerfile`.

## Solutions

### Solution 1: Verify Root Directory (Most Common)

1. **Go to Railway Dashboard:**
   - Navigate to your project → Coordinator Service
   - Click **Settings** tab

2. **Check Root Directory:**
   - Find **Root Directory** field
   - It should be set to: `services/coordinator`
   - ⚠️ **NOT** `/services/coordinator` (no leading slash)
   - ⚠️ **NOT** `/` (repository root)

3. **If it's wrong:**
   - Change it to: `services/coordinator`
   - Save settings
   - Trigger a new deployment

### Solution 2: Verify Dockerfile Path in railway.json

The `railway.json` file specifies:
```json
{
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"
  }
}
```

This means Railway looks for `Dockerfile` **relative to the Root Directory**.

- If Root Directory = `services/coordinator`
- Then Railway looks for: `services/coordinator/Dockerfile` ✅

### Solution 3: Check Railway Build Settings

1. **Go to Settings → Build & Deploy:**
   - **Builder:** Should be "Dockerfile" (not Nixpacks)
   - **Dockerfile Path:** Should be `Dockerfile` (relative to root directory)
   - **Build Command:** (can be empty, uses Dockerfile)

2. **If Builder is set to Nixpacks:**
   - Change it to "Dockerfile"
   - Set Dockerfile Path to: `Dockerfile`

### Solution 4: Verify Dockerfile is Committed

The Dockerfile must be committed to git for Railway to see it:

```bash
# Check if Dockerfile is in git
git ls-files services/coordinator/Dockerfile

# If not, add and commit it
git add services/coordinator/Dockerfile
git commit -m "Add Dockerfile"
git push origin main
```

### Solution 5: Alternative - Use Full Path in railway.json

If Railway still can't find it, try specifying the full path:

```json
{
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "services/coordinator/Dockerfile"
  }
}
```

But this should only be needed if Root Directory is set to repository root (`/`).

---

## Quick Checklist

- [ ] Root Directory is set to `services/coordinator` (no leading slash)
- [ ] Builder is set to "Dockerfile" (not Nixpacks)
- [ ] Dockerfile Path is `Dockerfile` (relative to root directory)
- [ ] Dockerfile is committed to git
- [ ] Latest code is pushed to the branch Railway is watching

---

## Most Likely Fix

**Set Root Directory to:** `services/coordinator`

1. Railway Dashboard → Coordinator Service → Settings
2. Find "Root Directory"
3. Set to: `services/coordinator`
4. Save
5. Redeploy

---

## Verify After Fix

After setting Root Directory correctly, Railway should:
1. Find the Dockerfile
2. Build the Docker image
3. Deploy the service

Check build logs to confirm Dockerfile is found and used.

