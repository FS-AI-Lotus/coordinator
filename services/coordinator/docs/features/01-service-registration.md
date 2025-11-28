# Feature 01: Service Registration & Management

**Status:** ✅ Active  
**Owner:** core-team  
**Last Updated:** 2025-01-XX

---

## Description

Service Registration & Management provides a two-stage registration process for microservices to register with the Coordinator. Services first register basic information (Stage 1: pending_migration), then upload migration files to become active (Stage 2: active). The feature also provides service discovery endpoints and health monitoring.

---

## Source Files

| File | Type | Lines | Purpose |
|------|------|-------|---------|
| `src/routes/register.js` | Route | ~234 | HTTP endpoints for service registration |
| `src/routes/services.js` | Route | ~35 | Service discovery endpoints |
| `src/routes/health.js` | Route | ~28 | Health check endpoint |
| `src/services/registryService.js` | Service | ~516 | Core registry business logic |

---

## Dependencies

### Incoming Dependencies (Features that depend on this)
- AI-Powered Routing
- Dual Protocol Support
- Knowledge Graph (circular - lazy loaded)
- Smart Proxy
- Monitoring & Observability
- Communication Services
- Schema Registry

### Outgoing Dependencies (Features this depends on)
- Database Integration (optional - Supabase)
- Knowledge Graph (circular - lazy loaded)
- Security & Validation
- Shared utilities (logger)

---

## API Endpoints

### HTTP Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/register` | Registration info endpoint (CI compatibility) |
| `POST` | `/register` | Register new service (Stage 1: pending_migration) |
| `POST` | `/register/:serviceId/migration` | Upload migration file (Stage 2: active) |
| `DELETE` | `/register/services` | Delete all services (admin) |
| `GET` | `/services` | List all services |
| `GET` | `/registry` | Alias for /services |
| `GET` | `/services/:serviceId` | Get service details |
| `GET` | `/health` | Health check with service count |

### gRPC Endpoints

None

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SUPABASE_URL` | No | - | Supabase database URL (optional) |
| `SUPABASE_ANON_KEY` | No | - | Supabase anonymous key (optional) |
| `SUPABASE_SERVICE_ROLE_KEY` | No | - | Supabase service role key (optional) |

**Note:** If Supabase is not configured, the service uses in-memory storage.

---

## Testing Instructions

### Register a Service (Two-Stage)

```bash
# Stage 1: Basic Registration
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{
    "serviceName": "test-service",
    "version": "1.0.0",
    "endpoint": "http://test:3000",
    "healthCheck": "/health",
    "description": "Test service"
  }'

# Response includes serviceId and status: "pending_migration"

# Stage 2: Upload Migration File
curl -X POST http://localhost:3000/register/{serviceId}/migration \
  -H "Content-Type: application/json" \
  -d '{
    "migrationFile": {
      "version": "1.0.0",
      "api": {
        "endpoints": [
          {"path": "/api/test", "method": "GET"}
        ]
      }
    }
  }'

# Service status changes to "active"
```

### List Services

```bash
# Get all services
curl http://localhost:3000/services

# Get specific service
curl http://localhost:3000/services/{serviceId}
```

### Health Check

```bash
curl http://localhost:3000/health
```

---

## Metrics

The following metrics are tracked:

- **Registered Services Total** (`coordinator_registered_services_total`)
  - Gauge metric tracking total number of registered services

- **Registration Requests Total** (`coordinator_registration_requests_total`)
  - Counter metric tracking registration attempts

- **Registration Failures Total** (`coordinator_registration_failures_total`)
  - Counter metric tracking failed registrations

- **Uptime** (`coordinator_uptime_seconds`)
  - Gauge metric tracking service uptime

Access metrics via: `GET /metrics`

---

## Future Enhancements

1. **Service Versioning**
   - Support for multiple versions of the same service
   - Version-based routing

2. **Service Health Monitoring**
   - Automatic health check polling
   - Automatic service removal on repeated failures

3. **Service Metadata Search**
   - Search services by capabilities
   - Filter by tags/metadata

4. **Service Dependencies Graph**
   - Visual representation of service dependencies
   - Dependency validation on registration

5. **Service Lifecycle Management**
   - Graceful service shutdown
   - Service migration support

6. **Multi-Tenant Support**
   - Tenant-specific service registries
   - Tenant isolation

---

## Related Documentation

- [Feature Mapping Proposal](../FEATURE_MAPPING_PROPOSAL.md)
- [API Documentation](../../API_DOCUMENTATION.md)
- [Service Examples](../../SERVICE_EXAMPLES.md)

