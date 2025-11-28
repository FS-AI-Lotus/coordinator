# 🔧 Railway Deployment Fixes

## Issues Fixed

### 1. ✅ gRPC Port Configuration Error

**Problem:**
```
Failed to parse DNS address dns:0.0.0.0:true
"port": "true"
```

**Root Cause:**
- `GRPC_PORT` environment variable was set to the string `"true"` instead of a port number
- Code was using `process.env.GRPC_PORT || 50051` which used "true" as the port

**Fix:**
- Updated `services/coordinator/src/grpc/server.js` to parse `GRPC_PORT` as integer
- Now validates that GRPC_PORT is a number before using it
- Defaults to 50051 if invalid or missing

**Code Change:**
```javascript
// Before
this.port = process.env.GRPC_PORT || 50051;

// After
const grpcPort = process.env.GRPC_PORT;
this.port = grpcPort && !isNaN(parseInt(grpcPort)) ? parseInt(grpcPort) : 50051;
```

**Railway Environment Variable Fix:**
- In Railway, set `GRPC_PORT=50051` (not `GRPC_PORT=true`)
- Or remove `GRPC_PORT` to use default 50051

---

### 2. ✅ Knowledge Graph Circular Dependency

**Problem:**
```
registryService.getAllServicesFull is not a function - skipping rebuild
Warning: Accessing non-existent property 'getAllServicesFull' of module exports inside circular dependency
```

**Root Cause:**
- Circular dependency between `registryService.js` and `knowledgeGraphService.js`
- `registryService` requires `knowledgeGraphService` at module level
- `knowledgeGraphService` requires `registryService` at module level
- When `knowledgeGraphService` tries to use `registryService.getAllServicesFull()`, the module isn't fully initialized

**Fix:**
- Changed `registryService.js` to use lazy require for `knowledgeGraphService`
- `knowledgeGraphService` is now loaded only when needed (inside methods)
- Breaks the circular dependency at module initialization time

**Code Change:**
```javascript
// Before
const knowledgeGraphService = require('./knowledgeGraphService');

// After
let knowledgeGraphService = null;
function getKnowledgeGraphService() {
  if (!knowledgeGraphService) {
    knowledgeGraphService = require('./knowledgeGraphService');
  }
  return knowledgeGraphService;
}

// Usage
await getKnowledgeGraphService().rebuildGraph();
```

---

## Railway Environment Variables to Check

### Required Fix:

1. **GRPC_PORT** - Should be a number, not "true"
   - ✅ Correct: `GRPC_PORT=50051`
   - ❌ Wrong: `GRPC_PORT=true`

### Optional (Already Set):

- `NODE_ENV=production` ✅
- `PORT` (Railway sets automatically) ✅
- `SUPABASE_URL` ✅
- `SUPABASE_ANON_KEY` ✅
- `OPENAI_API_KEY` ✅
- `AI_ROUTING_ENABLED=true` ✅

---

## Expected Logs After Fix

### ✅ Correct Logs:

```
Coordinator HTTP server started { port: 8080, environment: 'production' }
gRPC server started successfully { port: 50051, address: '0.0.0.0:50051', service: 'CoordinatorService' }
Both HTTP and gRPC servers are running { httpPort: 8080, grpcPort: 50051 }
Knowledge graph initialized on startup { totalServices: 4 }
```

### ❌ Errors Should Be Gone:

- ❌ `Failed to parse DNS address dns:0.0.0.0:true`
- ❌ `registryService.getAllServicesFull is not a function`
- ❌ `Accessing non-existent property 'getAllServicesFull' of module exports inside circular dependency`

---

## Next Steps

1. **Update Railway Environment Variable:**
   - Go to Railway → Coordinator Service → Variables
   - Find `GRPC_PORT`
   - Change from `true` to `50051` (or delete it to use default)
   - Save and redeploy

2. **Verify After Redeploy:**
   - Check logs for gRPC server starting successfully
   - Check logs for knowledge graph initializing without errors
   - Test gRPC endpoint if needed

---

**Fixes Committed and Ready to Deploy** ✅

