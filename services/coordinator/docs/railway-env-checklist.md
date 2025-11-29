# 🚂 Railway Environment Variables Checklist

**Service:** Coordinator  
**Platform:** Railway  
**Last Updated:** $(date)

---

## ✅ Required Environment Variables (Must Set)

These variables are **required** for the coordinator service to run properly in Railway:

| Variable | Value | Description | Default if Missing |
|----------|-------|-------------|-------------------|
| `PORT` | `3000` or Railway auto | HTTP server port | `3000` |
| `NODE_ENV` | `production` | Environment mode | `development` |

**⚠️ Important:** Railway usually sets `PORT` automatically, but you should verify it's set correctly.

---

## 🔧 Recommended Environment Variables

These are **highly recommended** for production:

| Variable | Recommended Value | Description | Why It's Important |
|----------|-------------------|-------------|-------------------|
| `LOG_LEVEL` | `info` or `warn` | Logging verbosity | Better production logging |
| `GRPC_ENABLED` | `true` | Enable gRPC server | Required for gRPC functionality |
| `GRPC_PORT` | `50051` | gRPC server port | Default gRPC port |
| `DEFAULT_PROTOCOL` | `http` | Default communication protocol | Protocol selection |

---

## 🤖 AI Routing Variables (Optional but Recommended)

If you want AI-powered routing:

| Variable | Value | Description | Required? |
|----------|-------|-------------|-----------|
| `OPENAI_API_KEY` | `sk-proj-...` | OpenAI API key | ✅ Yes (if AI enabled) |
| `AI_ROUTING_ENABLED` | `true` | Enable AI routing | ✅ Yes (if using AI) |
| `AI_MODEL` | `gpt-4o-mini` | OpenAI model to use | No (defaults to gpt-4o-mini) |
| `AI_FALLBACK_ENABLED` | `true` | Enable fallback routing | No (defaults to true) |

**Note:** If `AI_ROUTING_ENABLED=true`, you **must** set `OPENAI_API_KEY` or the service will fail.

---

## 🗄️ Supabase Variables (Optional)

For persistent storage (otherwise uses in-memory):

| Variable | Value | Description | Required? |
|----------|-------|-------------|-----------|
| `SUPABASE_URL` | `https://xxx.supabase.co` | Supabase project URL | No (uses in-memory if missing) |
| `SUPABASE_ANON_KEY` | `eyJhbGc...` | Supabase anonymous key | No (uses in-memory if missing) |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGc...` | Supabase service role key | No (optional, use with caution) |

**Note:** Without Supabase, data will be lost on service restart. For production, set these.

---

## ⚙️ Advanced Routing Variables (Optional)

Fine-tune routing behavior:

| Variable | Default | Description | When to Change |
|----------|---------|-------------|----------------|
| `MAX_FALLBACK_ATTEMPTS` | `5` | Max fallback attempts | If you want more/less retries |
| `MIN_QUALITY_SCORE` | `0.5` | Min quality score (0.0-1.0) | Adjust AI routing threshold |
| `STOP_ON_FIRST_SUCCESS` | `true` | Stop after first success | Set to `false` for multiple attempts |
| `ATTEMPT_TIMEOUT` | `3000` | Timeout per attempt (ms) | Adjust for slower services |

---

## 📋 Railway Configuration Checklist

### Step 1: Basic Configuration ✅

- [ ] `PORT` - Railway usually sets this automatically (verify it's set)
- [ ] `NODE_ENV=production` - **CRITICAL: Must be set to production**

### Step 2: Core Service Settings ✅

- [ ] `LOG_LEVEL=info` - For production logging
- [ ] `GRPC_ENABLED=true` - If you need gRPC support
- [ ] `GRPC_PORT=50051` - If GRPC_ENABLED=true
- [ ] `DEFAULT_PROTOCOL=http` - Protocol preference

### Step 3: AI Routing (If Using) ✅

- [ ] `OPENAI_API_KEY` - Your OpenAI API key (get from https://platform.openai.com/api-keys)
- [ ] `AI_ROUTING_ENABLED=true` - Enable AI routing
- [ ] `AI_MODEL=gpt-4o-mini` - Model selection (optional)
- [ ] `AI_FALLBACK_ENABLED=true` - Enable fallback (recommended)

### Step 4: Database (If Using) ✅

- [ ] `SUPABASE_URL` - Your Supabase project URL
- [ ] `SUPABASE_ANON_KEY` - Your Supabase anonymous key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Only if you need elevated permissions (use with caution)

### Step 5: Advanced (Optional) ✅

- [ ] `MAX_FALLBACK_ATTEMPTS=5` - Adjust if needed
- [ ] `MIN_QUALITY_SCORE=0.5` - Adjust if needed
- [ ] `STOP_ON_FIRST_SUCCESS=true` - Adjust if needed
- [ ] `ATTEMPT_TIMEOUT=3000` - Adjust if needed

---

## 🎯 Quick Setup Templates

### Minimal Setup (No AI, No Database)
```env
NODE_ENV=production
LOG_LEVEL=info
GRPC_ENABLED=true
GRPC_PORT=50051
DEFAULT_PROTOCOL=http
```

### Recommended Setup (With AI Routing)
```env
NODE_ENV=production
LOG_LEVEL=info

# gRPC
GRPC_ENABLED=true
GRPC_PORT=50051
DEFAULT_PROTOCOL=http

# AI Routing
OPENAI_API_KEY=sk-proj-your-key-here
AI_ROUTING_ENABLED=true
AI_MODEL=gpt-4o-mini
AI_FALLBACK_ENABLED=true
```

### Full Setup (With AI + Database)
```env
NODE_ENV=production
LOG_LEVEL=info

# gRPC
GRPC_ENABLED=true
GRPC_PORT=50051
DEFAULT_PROTOCOL=http

# AI Routing
OPENAI_API_KEY=sk-proj-your-key-here
AI_ROUTING_ENABLED=true
AI_MODEL=gpt-4o-mini
AI_FALLBACK_ENABLED=true

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Advanced Routing
MAX_FALLBACK_ATTEMPTS=5
MIN_QUALITY_SCORE=0.5
STOP_ON_FIRST_SUCCESS=true
ATTEMPT_TIMEOUT=3000
```

---

## 🔍 How to Verify in Railway

1. **Go to Railway Dashboard**
   - Navigate to your project
   - Select the `coordinator` service

2. **Check Variables Tab**
   - Click on "Variables" or "Environment"
   - Verify all required variables are set
   - Check that `NODE_ENV=production` is set

3. **Test the Service**
   - Check service logs for any missing variable warnings
   - Test health endpoint: `https://your-service.railway.app/health`
   - Verify gRPC if enabled: Check logs for "gRPC server started"

---

## ⚠️ Common Issues

### Issue: Service won't start
- **Check:** Is `NODE_ENV=production` set?
- **Check:** Is `PORT` set? (Railway usually sets this automatically)

### Issue: AI Routing not working
- **Check:** Is `AI_ROUTING_ENABLED=true`?
- **Check:** Is `OPENAI_API_KEY` set and valid?
- **Check:** Logs for OpenAI API errors

### Issue: Data lost on restart
- **Check:** Are `SUPABASE_URL` and `SUPABASE_ANON_KEY` set?
- **Solution:** Without Supabase, data is stored in-memory and lost on restart

### Issue: gRPC not working
- **Check:** Is `GRPC_ENABLED=true`?
- **Check:** Is `GRPC_PORT=50051` accessible?
- **Check:** Railway firewall/network settings

---

## 📝 Notes

- **Railway Auto-Set Variables:** Railway automatically sets `PORT` and `RAILWAY_ENVIRONMENT` - you usually don't need to set these manually
- **Sensitive Variables:** Mark `OPENAI_API_KEY` and Supabase keys as "Secret" in Railway
- **Variable Priority:** Railway environment variables override any `.env` files
- **Service Restart:** Changes to environment variables require a service restart

---

## 🔗 Related Documentation

- **Full Environment Guide:** `services/coordinator/RAILWAY_ENV_VARIABLES.md`
- **Deployment Guide:** `services/coordinator/DEPLOYMENT_GUIDE.md`
- **Terraform Config:** `infra/main.tf` (shows default env vars)

---

**Last Verified:** $(date)  
**Service Version:** 1.0.0


