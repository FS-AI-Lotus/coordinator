# 🗺️ Feature Mapping Proposal - Coordinator v2 Upgrade

**Status:** ⏸️ AWAITING APPROVAL  
**Generated:** 2025-01-XX  
**Purpose:** Map all existing files to 12 feature categories for documentation and tagging system

---

## 📋 Executive Summary

This proposal maps **27 source files** across **5 directories** to **12 distinct features**.  
All files are categorized with their roles, dependencies, and API endpoints.

**Total Files Mapped:** 27  
**Features Identified:** 12  
**HTTP Endpoints:** 23 routes  
**gRPC Methods:** 1 method (Route)

---

## 🎯 Feature Allocation Map

### Feature 01: Service Registration & Management

**Status:** ✅ Active  
**Owner:** core-team  
**Files (4):**

| File | Type | Lines | Purpose |
|------|------|-------|---------|
| `src/routes/register.js` | Route | ~234 | HTTP endpoints for service registration |
| `src/routes/services.js` | Route | ~35 | Service discovery endpoints |
| `src/routes/health.js` | Route | ~28 | Health check endpoint |
| `src/services/registryService.js` | Service | ~516 | Core registry business logic |

**HTTP Endpoints:**
- `GET /register` - Registration info endpoint
- `POST /register` - Register new service (Stage 1)
- `POST /register/:serviceId/migration` - Upload migration file (Stage 2)
- `DELETE /register/services` - Delete all services (admin)
- `GET /services` - List all services
- `GET /registry` - Alias for /services
- `GET /services/:serviceId` - Get service details
- `GET /health` - Health check with service count

**gRPC Endpoints:** None

**Dependencies:**
- `config/supabase.js` (optional - database)
- `services/knowledgeGraphService.js` (circular - lazy loaded)
- `utils/logger.js`
- `middleware/validation.js`

**Environment Variables:**
- `SUPABASE_URL` (optional)
- `SUPABASE_ANON_KEY` (optional)
- `SUPABASE_SERVICE_ROLE_KEY` (optional)

**Testing:**
```bash
# Register service
curl -X POST http://localhost:3000/register -H "Content-Type: application/json" -d '{"serviceName":"test","version":"1.0.0","endpoint":"http://test:3000","healthCheck":"/health"}'

# List services
curl http://localhost:3000/services

# Health check
curl http://localhost:3000/health
```

---

### Feature 02: AI-Powered Routing

**Status:** ✅ Active  
**Owner:** core-team  
**Files (3):**

| File | Type | Lines | Purpose |
|------|------|-------|---------|
| `src/routes/route.js` | Route | ~144 | HTTP routing endpoints |
| `src/services/aiRoutingService.js` | Service | ~492 | OpenAI-based routing logic |
| `src/config/routing.js` | Config | ~19 | Routing configuration |

**HTTP Endpoints:**
- `POST /route` - AI-based routing request
- `GET /route?q=<query>` - Simple query routing
- `GET /route` - Routing context/info

**gRPC Endpoints:** None (but used by gRPC handler)

**Dependencies:**
- `services/registryService.js` (get active services)
- `utils/logger.js`
- `middleware/validation.js`

**Environment Variables:**
- `AI_ROUTING_ENABLED=true` (required)
- `OPENAI_API_KEY` (required for AI routing)
- `OPENAI_MODEL` (optional, default: gpt-4o-mini)
- `OPENAI_API_URL` (optional)
- `AI_FALLBACK_ENABLED` (optional, default: true)
- `MAX_FALLBACK_ATTEMPTS` (optional, default: 5)
- `MIN_QUALITY_SCORE` (optional, default: 0.5)
- `STOP_ON_FIRST_SUCCESS` (optional, default: true)
- `ATTEMPT_TIMEOUT` (optional, default: 3000)

**Testing:**
```bash
# AI routing
curl -X POST http://localhost:3000/route -H "Content-Type: application/json" -d '{"query":"get user profile"}'

# Simple query
curl "http://localhost:3000/route?q=process payment"
```

---

### Feature 03: Dual Protocol Support (HTTP + gRPC)

**Status:** ✅ Active  
**Owner:** core-team  
**Files (6):**

| File | Type | Lines | Purpose |
|------|------|-------|---------|
| `src/index.js` | Main | ~197 | HTTP server setup & initialization |
| `src/grpc/server.js` | gRPC | ~204 | gRPC server implementation |
| `src/grpc/client.js` | gRPC | ~254 | gRPC client for microservices |
| `src/grpc/services/coordinator.service.js` | gRPC | ~309 | gRPC Route handler |
| `src/grpc/proto/coordinator.proto` | Proto | ~22 | Coordinator gRPC definitions |
| `src/grpc/proto/microservice.proto` | Proto | ~? | Microservice API definitions |

**HTTP Endpoints:**
- `GET /` - Root endpoint with service info

**gRPC Endpoints:**
- `rag.v1.CoordinatorService/Route` - Main routing RPC

**Dependencies:**
- `services/aiRoutingService.js`
- `services/registryService.js`
- `services/envelopeService.js`
- `services/communicationService.js`
- `services/metricsService.js`
- `utils/logger.js`

**Environment Variables:**
- `PORT` (HTTP port, default: 3000)
- `GRPC_ENABLED` (optional, default: true)
- `GRPC_PORT` (optional, default: 50051)
- `NODE_ENV` (optional)

**Testing:**
```bash
# HTTP
curl http://localhost:3000/

# gRPC (using grpcurl)
grpcurl -plaintext -d '{"tenant_id":"test","user_id":"user","query_text":"test query"}' localhost:50051 rag.v1.CoordinatorService/Route
```

---

### Feature 04: Knowledge Graph

**Status:** ✅ Active  
**Owner:** core-team  
**Files (2):**

| File | Type | Lines | Purpose |
|------|------|-------|---------|
| `src/routes/knowledgeGraph.js` | Route | ~67 | Knowledge graph endpoints |
| `src/services/knowledgeGraphService.js` | Service | ~451 | Graph building & management |

**HTTP Endpoints:**
- `GET /knowledge-graph` - Get knowledge graph
- `GET /graph` - Alias for /knowledge-graph
- `GET /knowledge-graph?rebuild=true` - Force rebuild
- `POST /knowledge-graph/rebuild` - Rebuild graph

**gRPC Endpoints:** None

**Dependencies:**
- `services/registryService.js` (circular - lazy loaded)
- `config/supabase.js` (optional - persistence)
- `utils/logger.js`

**Environment Variables:**
- `SUPABASE_URL` (optional)
- `SUPABASE_ANON_KEY` (optional)

**Testing:**
```bash
# Get graph
curl http://localhost:3000/knowledge-graph

# Rebuild
curl -X POST http://localhost:3000/knowledge-graph/rebuild
```

---

### Feature 05: Schema Registry

**Status:** ✅ Active  
**Owner:** core-team  
**Files (2):**

| File | Type | Lines | Purpose |
|------|------|-------|---------|
| `src/routes/schemas.js` | Route | ~182 | Schema management endpoints |
| `src/services/schemaRegistryService.js` | Service | ~419 | Schema validation & storage |

**HTTP Endpoints:**
- `GET /schemas` - List all schemas
- `GET /schemas/:serviceId` - Get service schemas
- `GET /schemas/:serviceId/:schemaType` - Get specific schema
- `POST /schemas/:serviceId/validate` - Validate data against schema
- `GET /schemas/:serviceId/compare/:version1/:version2` - Compare schema versions

**gRPC Endpoints:** None

**Dependencies:**
- `services/registryService.js`
- `utils/logger.js`
- `middleware/validation.js`

**Environment Variables:** None

**Testing:**
```bash
# List schemas
curl http://localhost:3000/schemas

# Get service schemas
curl http://localhost:3000/schemas/{serviceId}

# Validate
curl -X POST http://localhost:3000/schemas/{serviceId}/validate -H "Content-Type: application/json" -d '{"data":{},"schemaType":"request"}'
```

---

### Feature 06: System Changelog

**Status:** ✅ Active  
**Owner:** core-team  
**Files (2):**

| File | Type | Lines | Purpose |
|------|------|-------|---------|
| `src/routes/changelog.js` | Route | ~132 | Changelog endpoints |
| `src/services/changelogService.js` | Service | ~245 | Change tracking logic |

**HTTP Endpoints:**
- `GET /changelog` - Get changelog (paginated)
- `GET /changelog/stats` - Get changelog statistics
- `GET /changelog/search?q=<query>` - Search changelog
- `POST /changelog/cleanup` - Cleanup old entries

**gRPC Endpoints:** None

**Dependencies:**
- `utils/logger.js`

**Environment Variables:** None

**Testing:**
```bash
# Get changelog
curl http://localhost:3000/changelog

# Stats
curl http://localhost:3000/changelog/stats

# Search
curl "http://localhost:3000/changelog/search?q=payment"
```

---

### Feature 07: UI/UX Configuration

**Status:** ✅ Active  
**Owner:** core-team  
**Files (2):**

| File | Type | Lines | Purpose |
|------|------|-------|---------|
| `src/routes/uiux.js` | Route | ~68 | UI/UX config endpoints |
| `src/services/uiuxService.js` | Service | ~150 | Config management |

**HTTP Endpoints:**
- `GET /uiux` - Get UI/UX configuration
- `POST /uiux` - Update UI/UX configuration

**gRPC Endpoints:** None

**Dependencies:**
- `services/metricsService.js`
- `utils/logger.js`
- `middleware/validation.js`

**Environment Variables:**
- `UI_CONFIG_PATH` (optional - config file path)

**Testing:**
```bash
# Get config
curl http://localhost:3000/uiux

# Update config
curl -X POST http://localhost:3000/uiux -H "Content-Type: application/json" -d '{"config":{"theme":"dark"}}'
```

---

### Feature 08: Smart Proxy

**Status:** ✅ Active  
**Owner:** core-team  
**Files (2):**

| File | Type | Lines | Purpose |
|------|------|-------|---------|
| `src/routes/proxy.js` | Route | ~62 | Catch-all proxy route |
| `src/services/proxyService.js` | Service | ~267 | Request forwarding logic |

**HTTP Endpoints:**
- `* /*` - All unmatched routes (catch-all)

**gRPC Endpoints:** None

**Dependencies:**
- `services/aiRoutingService.js`
- `services/registryService.js`
- `utils/logger.js`

**Environment Variables:**
- `AI_ROUTING_ENABLED` (required for smart routing)

**Testing:**
```bash
# Any unmatched route goes through proxy
curl http://localhost:3000/api/payments/user/123
curl -X POST http://localhost:3000/api/users/profile -d '{"name":"test"}'
```

---

### Feature 09: Monitoring & Observability

**Status:** ✅ Active  
**Owner:** core-team  
**Files (4):**

| File | Type | Lines | Purpose |
|------|------|-------|---------|
| `src/routes/metrics.js` | Route | ~33 | Prometheus metrics endpoint |
| `src/routes/health.js` | Route | ~28 | Health check (shared with Feature 01) |
| `src/services/metricsService.js` | Service | ~200 | Metrics collection |
| `src/middleware/logger.js` | Middleware | ~50 | Request logging |

**HTTP Endpoints:**
- `GET /metrics` - Prometheus metrics
- `GET /health` - Health check (shared)

**gRPC Endpoints:** None

**Dependencies:**
- `services/registryService.js` (for health check)
- `utils/logger.js`

**Environment Variables:**
- `METRICS_ENABLED` (optional, default: true)
- `LOG_LEVEL` (optional, default: info)

**Testing:**
```bash
# Metrics
curl http://localhost:3000/metrics

# Health
curl http://localhost:3000/health
```

---

### Feature 10: Communication Services

**Status:** ✅ Active  
**Owner:** core-team  
**Files (2):**

| File | Type | Lines | Purpose |
|------|------|-------|---------|
| `src/services/envelopeService.js` | Service | ~211 | Universal envelope creation |
| `src/services/communicationService.js` | Service | ~745 | Protocol abstraction layer |

**HTTP Endpoints:** None (used internally)

**gRPC Endpoints:** None (used internally)

**Dependencies:**
- `grpc/client.js`
- `services/metricsService.js`
- `config/routing.js`
- `services/registryService.js`
- `utils/logger.js`

**Environment Variables:**
- `DEFAULT_PROTOCOL` (optional, default: http)
- `MAX_FALLBACK_ATTEMPTS` (optional, default: 5)
- `MIN_QUALITY_SCORE` (optional, default: 0.5)
- `STOP_ON_FIRST_SUCCESS` (optional, default: true)
- `ATTEMPT_TIMEOUT` (optional, default: 3000)

**Testing:** (Internal service - tested via routing/proxy)

---

### Feature 11: Security & Validation

**Status:** ✅ Active (Partial - JWT placeholder)  
**Owner:** core-team / Team 4  
**Files (3):**

| File | Type | Lines | Purpose |
|------|------|-------|---------|
| `src/middleware/validation.js` | Middleware | ~200 | Request validation |
| `src/middleware/jwt.js` | Middleware | ~25 | JWT placeholder (Team 4) |
| `src/middleware/errorHandler.js` | Middleware | ~50 | Error handling |

**HTTP Endpoints:** None (middleware only)

**gRPC Endpoints:** None (middleware only)

**Dependencies:**
- `utils/logger.js`

**Environment Variables:**
- `JWT_ENABLED` (optional, default: false)
- `JWT_SECRET` (optional - for future JWT validation)

**Testing:** (Middleware - tested via all endpoints)

---

### Feature 12: Database Integration

**Status:** ✅ Active (Optional)  
**Owner:** core-team  
**Files (1):**

| File | Type | Lines | Purpose |
|------|------|-------|---------|
| `src/config/supabase.js` | Config | ~33 | Supabase client configuration |

**HTTP Endpoints:** None (config only)

**gRPC Endpoints:** None (config only)

**Dependencies:** None

**Environment Variables:**
- `SUPABASE_URL` (optional)
- `SUPABASE_ANON_KEY` (optional)
- `SUPABASE_SERVICE_ROLE_KEY` (optional)

**Testing:** (Config - tested via features that use it)

---

## 📊 Shared/Common Files

### Utilities

| File | Type | Lines | Purpose | Used By |
|------|------|-------|---------|---------|
| `src/utils/logger.js` | Util | ~100 | Winston logger config | All features |

**Note:** This is a shared utility used by all features. Should remain in `utils/` or move to `shared/utils/`.

---

## 🔗 Dependency Graph

```
service-registration
  ├── database-integration (optional)
  ├── knowledge-graph (circular - lazy loaded)
  └── security-validation

ai-routing
  ├── service-registration
  └── security-validation

dual-protocol
  ├── ai-routing
  ├── service-registration
  ├── communication-services
  └── monitoring

knowledge-graph
  ├── service-registration (circular - lazy loaded)
  └── database-integration (optional)

schema-registry
  ├── service-registration
  └── security-validation

changelog
  └── (standalone)

uiux
  ├── monitoring
  └── security-validation

smart-proxy
  ├── ai-routing
  └── service-registration

monitoring
  └── service-registration

communication-services
  ├── dual-protocol (grpc client)
  ├── monitoring
  ├── ai-routing (via config)
  └── service-registration

security-validation
  └── (standalone middleware)

database-integration
  └── (standalone config)
```

---

## 📈 Statistics

| Metric | Count |
|--------|-------|
| **Total Source Files** | 27 |
| **Route Files** | 10 |
| **Service Files** | 10 |
| **Middleware Files** | 4 |
| **Config Files** | 2 |
| **gRPC Files** | 5 |
| **Utility Files** | 1 |
| **HTTP Endpoints** | 23 |
| **gRPC Methods** | 1 |
| **Features** | 12 |
| **Environment Variables** | ~20 |

---

## ✅ Approval Checklist

Before proceeding with Phases 1-7, please confirm:

- [ ] Feature allocation is correct
- [ ] File-to-feature mapping is accurate
- [ ] Dependencies are correctly identified
- [ ] API endpoints are complete
- [ ] Environment variables are documented
- [ ] Testing instructions are clear

---

## 🚦 Next Steps (After Approval)

Once approved, I will execute:

1. **Phase 1:** Create 12 feature documentation files in `docs/features/`
2. **Phase 2:** Create architecture documentation in `docs/architecture/`
3. **Phase 3:** Create developer guides in `docs/guides/`
4. **Phase 4:** Create 4 scaffold templates in `templates/`
5. **Phase 5:** Create feature generator script `scripts/create-feature.js`
6. **Phase 6:** Add feature tags to all 27 source files
7. **Phase 7:** Create validation script `scripts/validate-features.js`

---

**Status:** ⏸️ **AWAITING YOUR APPROVAL**

Please review this mapping and respond with:
- ✅ **"APPROVED"** - Proceed with Phases 1-7
- ⚠️ **"REVISIONS NEEDED"** - Specify changes needed
- ❌ **"REJECTED"** - Provide alternative approach

---

**Generated by:** Coordinator Feature Management System v2  
**Date:** 2025-01-XX

