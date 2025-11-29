# Feature 10: Communication Services

**Status:** ✅ Active  
**Owner:** core-team  
**Last Updated:** 2025-01-XX

---

## Description

Communication Services provides a protocol abstraction layer that enables seamless communication with microservices via both HTTP and gRPC protocols. It includes a Universal Envelope format for standardized message structure and cascading fallback mechanisms for reliable service communication.

---

## Source Files

| File | Type | Lines | Purpose |
|------|------|-------|---------|
| `src/services/envelopeService.js` | Service | ~211 | Universal envelope creation |
| `src/services/communicationService.js` | Service | ~745 | Protocol abstraction layer |

---

## Dependencies

### Incoming Dependencies (Features that depend on this)
- Dual Protocol Support

### Outgoing Dependencies (Features this depends on)
- Dual Protocol Support (gRPC client)
- Monitoring & Observability
- AI-Powered Routing (via config)
- Service Registration & Management
- Shared utilities (logger)

---

## API Endpoints

### HTTP Endpoints

None (used internally)

### gRPC Endpoints

None (used internally)

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DEFAULT_PROTOCOL` | No | `http` | Default communication protocol |
| `MAX_FALLBACK_ATTEMPTS` | No | `5` | Maximum fallback attempts |
| `MIN_QUALITY_SCORE` | No | `0.5` | Minimum quality score |
| `STOP_ON_FIRST_SUCCESS` | No | `true` | Stop on first success |
| `ATTEMPT_TIMEOUT` | No | `3000` | Timeout per attempt (ms) |

---

## Testing Instructions

This feature is tested indirectly through routing and proxy operations. To test:

1. Register services with both HTTP and gRPC endpoints
2. Make routing requests that trigger service calls
3. Verify cascading fallback behavior

---

## Metrics

The following metrics are tracked:

- **Communication Attempts Total** (`coordinator_communication_attempts_total`)
  - Counter metric tracking communication attempts

- **Communication Success** (`coordinator_communication_success_total`)
  - Counter metric tracking successful communications

- **Communication Failures** (`coordinator_communication_failures_total`)
  - Counter metric tracking failed communications

- **Cascading Fallback Used** (`coordinator_cascading_fallback_total`)
  - Counter metric tracking cascading fallback usage

Access metrics via: `GET /metrics`

---

## Future Enhancements

1. **Protocol Auto-Detection**
   - Automatic protocol selection
   - Protocol negotiation

2. **Connection Pooling**
   - HTTP connection pooling
   - gRPC connection reuse

3. **Retry Strategies**
   - Configurable retry strategies
   - Exponential backoff

4. **Request Batching**
   - Batch multiple requests
   - Reduce network overhead

5. **Message Queuing**
   - Async message queuing
   - Reliable delivery

6. **Protocol Adapters**
   - Support for additional protocols
   - Protocol plugins

---

## Related Documentation

- [Cascading Fallback](../../CASCADING_FALLBACK.md)
- [Integration Guide](../../INTEGRATION_GUIDE.md)


