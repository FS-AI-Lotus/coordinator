# 🔍 Troubleshooting: Services Not Visible in Supabase

If you're not seeing microservices in Supabase, here's how to check and fix it.

---

## ✅ Step 1: Verify Supabase Connection

The coordinator logs show Supabase is connected:
```
Supabase client initialized {
  "url": "https://uvtokmcqefpywfhomemr.supabase.co",
  "hasKey": true
}
```

This means:
- ✅ `SUPABASE_URL` is set correctly
- ✅ `SUPABASE_ANON_KEY` or `SUPABASE_SERVICE_ROLE_KEY` is set

---

## 📋 Step 2: Check the Correct Table

Services are stored in the **`registered_services`** table.

**In Supabase Dashboard:**
1. Go to **Table Editor**
2. Look for table: **`registered_services`**
3. Check if it exists and has data

---

## 🔒 Step 3: Check Row Level Security (RLS)

**This is likely the issue!** RLS might be blocking your view.

### Check RLS Status:

1. Go to Supabase Dashboard → **Table Editor** → `registered_services`
2. Click on **"Policies"** tab (or **"RLS"** tab)
3. Check if RLS is **enabled**

### If RLS is Enabled:

You need to check/create policies. The schema includes a policy, but it might not be working.

**Option A: Disable RLS (for development/testing)**

Run this SQL in Supabase SQL Editor:
```sql
ALTER TABLE registered_services DISABLE ROW LEVEL SECURITY;
```

**Option B: Create/Update RLS Policy (recommended for production)**

Run this SQL in Supabase SQL Editor:
```sql
-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON registered_services;

-- Create a policy that allows all operations (for development)
CREATE POLICY "Allow all operations" 
  ON registered_services
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

**Option C: Use Service Role Key (bypasses RLS)**

If you're using `SUPABASE_ANON_KEY`, switch to `SUPABASE_SERVICE_ROLE_KEY` in Railway:
- This key bypasses RLS policies
- More powerful - use with caution

---

## 🔍 Step 4: Verify Table Structure

Make sure the table has the correct structure. Run this in Supabase SQL Editor:

```sql
-- Check if table exists
SELECT * FROM registered_services LIMIT 10;

-- Check table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'registered_services';
```

**Expected columns:**
- `id` (UUID)
- `service_name` (VARCHAR)
- `version` (VARCHAR)
- `endpoint` (TEXT)
- `health_check` (VARCHAR)
- `migration_file` (JSONB)
- `registered_at` (TIMESTAMPTZ)
- `last_health_check` (TIMESTAMPTZ)
- `status` (VARCHAR)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

---

## 🛠️ Step 5: Create Table if Missing

If the table doesn't exist, run the schema:

1. Go to Supabase Dashboard → **SQL Editor**
2. Copy the contents of `services/coordinator/supabase-schema.sql`
3. Run it in the SQL Editor

Or run this simplified version:

```sql
-- Create the registered_services table
CREATE TABLE IF NOT EXISTS registered_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name VARCHAR(255) NOT NULL,
  version VARCHAR(50) NOT NULL,
  endpoint TEXT NOT NULL,
  health_check VARCHAR(255) DEFAULT '/health',
  migration_file JSONB DEFAULT '{}',
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  last_health_check TIMESTAMPTZ,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_registered_services_service_name ON registered_services(service_name);
CREATE INDEX IF NOT EXISTS idx_registered_services_status ON registered_services(status);

-- Disable RLS for now (enable later with proper policies)
ALTER TABLE registered_services DISABLE ROW LEVEL SECURITY;
```

---

## 🔑 Step 6: Check Railway Environment Variables

Verify in Railway that these are set correctly:

1. Go to Railway Dashboard → Coordinator Service → **Variables**
2. Check:
   - `SUPABASE_URL` = `https://uvtokmcqefpywfhomemr.supabase.co`
   - `SUPABASE_ANON_KEY` = (your anon key)
   - OR `SUPABASE_SERVICE_ROLE_KEY` = (your service role key)

**Note:** If using `SUPABASE_ANON_KEY`, RLS policies must allow access.
If using `SUPABASE_SERVICE_ROLE_KEY`, RLS is bypassed.

---

## 🧪 Step 7: Test Direct Query

Test if you can query Supabase directly:

**In Supabase SQL Editor:**
```sql
-- Count services
SELECT COUNT(*) FROM registered_services;

-- View all services
SELECT * FROM registered_services ORDER BY registered_at DESC;

-- Check specific service
SELECT * FROM registered_services WHERE service_name = 'my-microservice1';
```

---

## 🐛 Common Issues

### Issue 1: RLS Blocking Access
**Symptom:** Table exists but shows empty or "permission denied"
**Solution:** Disable RLS or create proper policies (see Step 3)

### Issue 2: Wrong Table Name
**Symptom:** Can't find table
**Solution:** Table is `registered_services` (plural, with underscore)

### Issue 3: Using ANON Key with RLS
**Symptom:** Can read but can't write, or can't see data
**Solution:** Use `SUPABASE_SERVICE_ROLE_KEY` or fix RLS policies

### Issue 4: Table Not Created
**Symptom:** Table doesn't exist
**Solution:** Run the schema SQL (see Step 5)

---

## ✅ Quick Fix (Recommended for Testing)

Run this in Supabase SQL Editor to quickly fix RLS:

```sql
-- Disable RLS temporarily
ALTER TABLE registered_services DISABLE ROW LEVEL SECURITY;

-- Verify you can see data
SELECT * FROM registered_services;
```

**After confirming it works, re-enable RLS with proper policies:**
```sql
ALTER TABLE registered_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations" 
  ON registered_services
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

---

## 📊 Expected Data

Based on your coordinator, you should see **4 services** in Supabase:

1. `test-service-smoke-1764278046367`
2. `test-service-smoke-1764276396511`
3. `my-microservice1`
4. `my-service`

All should be in the `registered_services` table.

---

**Most likely issue: RLS is enabled and blocking your view!** 🔒

