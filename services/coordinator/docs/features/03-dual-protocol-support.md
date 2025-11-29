# Feature 03: Dual Protocol Support (HTTP + gRPC)

**Status:** ✅ Active  
**Owner:** core-team  
**Last Updated:** 2025-01-XX

---

## Description

Dual Protocol Support enables the Coordinator to handle both HTTP REST and gRPC requests simultaneously. The HTTP server handles traditional REST API calls, while the gRPC server provides high-performance RPC interface for RAG integration. Both protocols use the same underlying routing and business logic, ensuring consistency across protocols.

---

## Source Files

| File | Type | Lines | Purpose |
|------|------|-------|---------|
| `src/index.js` | Main | ~197 | HTTP server setup & initialization |
| `src/grpc/server.js` | gRPC | ~204 | gRPC server implementation |
| `src/grpc/client.js` | gRPC | ~254 | gRPC client for microservices |
| `src/grpc/services/coordinator.service.js` | gRPC | ~309 | gRPC Route handler |
| `src/grpc/proto/coordinator.proto` | Proto | ~22 | Coordinator gRPC definitions |
| `src/grpc/proto/microservice.proto` | Proto | ~? | Microservice API definitions |

---

## Dependencies

### Incoming Dependencies (Features that depend on this)
- Communication Services (uses gRPC client)

### Outgoing Dependencies (Features this depends on)
- AI-Powered Routing
- Service Registration & Management
- Communication Services
- Monitoring & Observability
- Shared utilities (logger)

---

## API Endpoints

### HTTP Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/` | Root endpoint with service info |

### gRPC Endpoints

| Service | Method | Description |
|---------|--------|-------------|
| `rag.v1.CoordinatorService` | `Route` | Main routing RPC for RAG integration |

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `3000` | HTTP server port |
| `GRPC_ENABLED` | No | `true` | Enable gRPC server |
| `GRPC_PORT` | No | `50051` | gRPC server port |
| `NODE_ENV` | No | `development` | Environment mode |

---

## Testing Instructions

### HTTP Server

```bash
# Root endpoint
curl http://localhost:3000/
```

### gRPC Server

```bash
# Using grpcurl
grpcurl -plaintext \
  -d '{
    "tenant_id": "test-tenant",
    "user_id": "test-user",
    "query_text": "process payment for order 123",
    "metadata": {"source": "rag"}
  }' \
  localhost:50051 \
  rag.v1.CoordinatorService/Route
```

### Verify Both Servers Running

```bash
# Check HTTP
curl http://localhost:3000/health

# Check gRPC (requires grpcurl)
grpcurl -plaintext localhost:50051 list
```

---

## Metrics

The following metrics are tracked:

- **HTTP Requests Total** (`coordinator_http_requests_total`)
  - Counter metric tracking HTTP requests

- **gRPC Requests Total** (`coordinator_grpc_requests_total`)
  - Counter metric tracking gRPC requests

- **Server Uptime** (`coordinator_uptime_seconds`)
  - Gauge metric tracking server uptime

- **gRPC Client Connections** (`coordinator_grpc_client_connections`)
  - Gauge metric tracking active gRPC connections

Access metrics via: `GET /metrics`

---

## Future Enhancements

1. **Protocol Auto-Detection**
   - Automatic protocol selection
   - Protocol negotiation

2. **HTTP/2 Support**
   - HTTP/2 server support
   - Better performance for HTTP

3. **WebSocket Support**
   - WebSocket protocol support
   - Real-time communication

4. **Protocol Load Balancing**
   - Distribute load across protocols
   - Protocol-specific routing

5. **Protocol Metrics Dashboard**
   - Visual comparison of protocol performance
   - Protocol usage analytics

6. **Protocol Migration Tools**
   - Tools for migrating between protocols
   - Protocol compatibility layer

---

## Related Documentation

- [Endpoints Guide](../../ENDPOINTS_GUIDE.md)
- [Integration Guide](../../INTEGRATION_GUIDE.md)


