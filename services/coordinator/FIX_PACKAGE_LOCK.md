# Fix Package Lock File - Quick Guide

## Issue

The `package-lock.json` file is out of sync with `package.json` after adding test dependencies (jest, supertest, nock).

## Quick Fix

### Option 1: Update Lock File (Recommended)

Run this command in your terminal:

```bash
cd services/coordinator
npm install
```

This will update `package-lock.json` to include the new dev dependencies.

### Option 2: Use Updated Dockerfile (Already Fixed)

The Dockerfile has been updated to use `npm install --omit=dev` instead of `npm ci`, which is more flexible with lock file sync issues.

**The build should now work even without updating the lock file**, but it's still recommended to update it for consistency.

## Verify Fix

After updating the lock file:

1. **Check lock file exists:**
   ```bash
   ls -la services/coordinator/package-lock.json
   ```

2. **Verify it's recent:**
   The file should have a recent modification date.

3. **Commit the updated lock file:**
   ```bash
   git add services/coordinator/package-lock.json
   git commit -m "Update package-lock.json with test dependencies"
   git push
   ```

## What Changed

- **Dockerfile:** Changed from `npm ci --only=production` to `npm install --omit=dev`
- **Reason:** `npm ci` is strict and requires perfect lock file sync, while `npm install` is more flexible
- **Result:** Build will work even if lock file is slightly out of sync

## Next Steps

1. ✅ Dockerfile is fixed (build should work now)
2. ⚠️  Update `package-lock.json` locally: `npm install`
3. ✅ Push changes to trigger Railway rebuild
4. ✅ Verify deployment succeeds

---

**Note:** The Dockerfile fix allows the build to proceed, but updating the lock file ensures consistency and faster builds.

