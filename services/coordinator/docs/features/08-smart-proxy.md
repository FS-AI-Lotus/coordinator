# Feature 08: Smart Proxy

**Status:** ✅ Active  
**Owner:** core-team  
**Last Updated:** 2025-01-XX

---

## Description

Smart Proxy automatically routes all unmatched HTTP requests through AI-powered routing to forward them to the appropriate microservice. It acts as a catch-all route handler that intelligently determines the target service based on the request path, method, and body content, then proxies the request transparently.

---

## Source Files

| File | Type | Lines | Purpose |
|------|------|-------|---------|
| `src/routes/proxy.js` | Route | ~62 | Catch-all proxy route |
| `src/services/proxyService.js` | Service | ~267 | Request forwarding logic |

---

## Dependencies

### Incoming Dependencies (Features that depend on this)
- None (standalone feature)

### Outgoing Dependencies (Features this depends on)
- AI-Powered Routing
- Service Registration & Management
- Shared utilities (logger)

---

## API Endpoints

### HTTP Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `*` | `/*` | All unmatched routes (catch-all) |

**Note:** This route catches all requests that don't match coordinator-specific endpoints.

### gRPC Endpoints

None

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `AI_ROUTING_ENABLED` | Yes | `false` | Required for smart routing |

---

## Testing Instructions

### Proxy Unmatched Routes

```bash
# Any unmatched route goes through proxy
curl http://localhost:3000/api/payments/user/123

# POST requests
curl -X POST http://localhost:3000/api/users/profile \
  -H "Content-Type: application/json" \
  -d '{"name": "test"}'

# PUT requests
curl -X PUT http://localhost:3000/api/inventory/update \
  -H "Content-Type: application/json" \
  -d '{"id": 1, "quantity": 10}'
```

**Note:** Coordinator-specific endpoints (like `/register`, `/services`, etc.) are handled by their respective routes and do not go through the proxy.

---

## Metrics

The following metrics are tracked:

- **Proxy Requests Total** (`coordinator_proxy_requests_total`)
  - Counter metric tracking proxied requests

- **Proxy Success** (`coordinator_proxy_success_total`)
  - Counter metric tracking successful proxies

- **Proxy Failures** (`coordinator_proxy_failures_total`)
  - Counter metric tracking failed proxies

- **Proxy Latency** (`coordinator_proxy_latency_ms`)
  - Histogram metric tracking proxy performance

Access metrics via: `GET /metrics`

---

## Future Enhancements

1. **Request Caching**
   - Cache proxy responses
   - Reduce backend load

2. **Load Balancing**
   - Distribute load across service instances
   - Health-aware routing

3. **Request Transformation**
   - Transform requests before proxying
   - Request/response mapping

4. **Circuit Breaker**
   - Circuit breaker pattern
   - Automatic failover

5. **Rate Limiting**
   - Per-service rate limiting
   - Request throttling

6. **Request Logging**
   - Detailed request/response logging
   - Audit trail

---

## Related Documentation

- [AI Routing Guide](../../AI_ROUTING_GUIDE.md)
- [API Documentation](../../API_DOCUMENTATION.md)


