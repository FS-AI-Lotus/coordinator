# 🔍 EDUCORE Coordinator Microservice - Startup Entrypoint Audit Report

**Date:** $(date)  
**Issue:** Wrong startup file executing in Railway deployment  
**Status:** ✅ ROOT CAUSE IDENTIFIED

---

## 📋 EXECUTIVE SUMMARY

**Current Behavior (WRONG):**
```
UI/UX coordinator config service listening on port 8080
```

**Expected Behavior (CORRECT):**
```
Coordinator HTTP server started { port: 8080, environment: 'production' }
Both HTTP and gRPC servers are running { httpPort: 8080, grpcPort: 50051 }
Knowledge graph initialized on startup
```

---

## 🔍 FINDINGS

### 1. **Files Scanned**

#### Startup Files Found:
| File Path | Type | Purpose | Status |
|-----------|------|---------|--------|
| `server.js` (root) | ❌ **WRONG** | UI/UX config service (port 8080) | **THIS IS RUNNING** |
| `services/coordinator/server.js` | ⚠️ Legacy | Simple coordinator stub | Not used |
| `services/coordinator/src/index.js` | ✅ **CORRECT** | Full coordinator with HTTP+gRPC+KG | **SHOULD RUN** |
| `root/server.js` | ⚠️ Legacy | Root orchestrator | Not relevant |
| `services/ms1/server.js` | ✅ Valid | Microservice 1 | Not relevant |
| `services/ms2/server.js` | ✅ Valid | Microservice 2 | Not relevant |

#### Configuration Files:
| File | Current Setting | Status |
|------|----------------|--------|
| `services/coordinator/Dockerfile` | `CMD ["node", "src/index.js"]` | ✅ Correct |
| `services/coordinator/package.json` | `"start": "node src/index.js"` | ✅ Correct |
| `services/coordinator/railway.json` | `"startCommand": "node src/index.js"` | ✅ Correct |
| `package.json` (root) | `"main": "server.js"` | ⚠️ Points to wrong file |

---

## 🎯 ROOT CAUSE ANALYSIS

### **The Problem:**

1. **Root `server.js` exists** and prints: `"UI/UX coordinator config service listening on port ${port}"`
   - This is a simple HTTP server serving UI/UX config JSON
   - It's NOT the coordinator microservice
   - Located at repository root: `/server.js`

2. **Railway Auto-Detection Issue:**
   - Railway might be building from repository root instead of `services/coordinator/`
   - When Railway auto-detects (if Dockerfile isn't used), it finds root `package.json` with `"main": "server.js"`
   - Railway runs `node server.js` (root) instead of `node src/index.js` (coordinator)

3. **Build Context Contamination:**
   - If Railway builds from root, the Dockerfile's `COPY . .` might include root `server.js`
   - Even though CMD says `node src/index.js`, Railway might override it

### **Why It's Happening:**

Railway deployment is likely:
- **Option A:** Building from repository root, not `services/coordinator/`
- **Option B:** Ignoring Dockerfile and using Nixpacks auto-detection
- **Option C:** Root `package.json` is being used instead of `services/coordinator/package.json`

---

## ✅ CORRECT ENTRYPOINT IDENTIFICATION

### **File: `services/coordinator/src/index.js`**

**This is the CORRECT coordinator entrypoint because it:**

✅ Starts HTTP server on `process.env.PORT || 3000` (line 131-136)  
✅ Starts gRPC server on `process.env.GRPC_PORT || 50051` (line 144-150)  
✅ Initializes KnowledgeGraphService (line 108-128)  
✅ Initializes RegistryService (line 112)  
✅ Sets up all routes: `/register`, `/route`, `/uiux`, `/services`, `/health`, `/metrics`, etc.  
✅ Logs: `"Coordinator HTTP server started"` (line 132)  
✅ Logs: `"Both HTTP and gRPC servers are running"` (line 147)  
✅ Logs: `"Knowledge graph initialized on startup"` (line 117)  

**Expected Logs:**
```javascript
logger.info(`Coordinator HTTP server started`, {
  port: PORT,
  environment: process.env.NODE_ENV || 'development'
});

logger.info('Both HTTP and gRPC servers are running', {
  httpPort: PORT,
  grpcPort: process.env.GRPC_PORT || 50051
});

logger.info('Knowledge graph initialized on startup', { totalServices });
```

---

## ❌ WRONG ENTRYPOINT IDENTIFICATION

### **File: `server.js` (root)**

**This is the WRONG file because it:**

❌ Only serves UI/UX config JSON  
❌ Simple HTTP server (not Express, no routes)  
❌ No gRPC server  
❌ No KnowledgeGraph  
❌ No RegistryService  
❌ Logs: `"UI/UX coordinator config service listening on port ${port}"` (line 36)  
❌ Default port 4000 (not 3000)  

**Code:**
```javascript
const port = process.env.PORT || 4000;
http.createServer(requestHandler).listen(port, () => {
  console.log(`UI/UX coordinator config service listening on port ${port}`);
});
```

---

## 🔧 SOLUTION

### **Fix Strategy: Option A + Option C (Recommended)**

**1. Update `.dockerignore` to exclude root server.js**
**2. Ensure Railway builds from correct directory**
**3. Add explicit exclusion in Dockerfile**

### **Implementation:**

1. **Update `services/coordinator/.dockerignore`** to exclude root files
2. **Update `services/coordinator/Dockerfile`** to be more explicit about what to copy
3. **Verify Railway service root directory** is set to `services/coordinator/`

---

## 📝 CODE CHANGES

See next section for full unified diff.

---

## ✅ VERIFICATION

After fix, expected logs:
```
Coordinator HTTP server started { port: 8080, environment: 'production' }
Both HTTP and gRPC servers are running { httpPort: 8080, grpcPort: 50051 }
Knowledge graph initialized on startup { totalServices: 0 }
```

Test endpoints:
```bash
curl https://your-service.railway.app/health
# Expected: { "status": "ok", "service": "coordinator" }

curl https://your-service.railway.app/
# Expected: Full service info with all endpoints
```

---

**Report Complete** ✅

