# Feature 13: Unified Proxy Endpoint

**Status:** ✅ Active  
**Owner:** core-team  
**Last Updated:** 2025-01-XX

---

## Description

Unified Proxy Endpoint provides a standardized inter-service communication gateway for all microservices. It acts as a complete proxy that receives requests from any microservice, uses AI routing to determine the target service, forwards the request, and maps the response to match the requester's expected format. This feature enables seamless communication between microservices without requiring direct service-to-service connections.

---

## Source Files

| File | Type | Lines | Purpose |
|------|------|-------|---------|
| `src/routes/unified-proxy.js` | Route | ~415 | Unified proxy endpoint implementation |
| `tests/deployment.test.js` | Test | ~196 | Deployment tests for live Railway instance |
| `tests/unified-proxy.test.js` | Test | ~1525 | Comprehensive unit and integration tests |

---

## Dependencies

### Incoming Dependencies (Features that depend on this)
- None (standalone feature)

### Outgoing Dependencies (Features this depends on)
- AI-Powered Routing (for intelligent service selection)
- Service Registration & Management (for service discovery)
- Smart Proxy (for request forwarding patterns)
- Security & Validation (for input sanitization)
- Shared utilities (logger)

---

## API Endpoints

### HTTP Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/fill-content-metrics/` | Unified proxy endpoint for inter-service communication |

### gRPC Endpoints

None

---

## Request Format

All microservices send requests in this standardized format:

```json
{
  "requester_service": "service-name",
  "payload": {
    // Service-specific data (can be empty object)
  },
  "response": {
    // Template defining expected response structure
    // Field names that the requester expects
  }
}
```

### Required Fields

- `requester_service` (string): Name of the service making the request
- `response` (object): Template defining expected response structure with field names
- `payload` (object, optional): Service-specific data (can be empty object `{}`)

---

## Response Format

### Success Response (200 OK)

```json
{
  "success": true,
  "data": {
    // Mapped response matching the response template
  },
  "metadata": {
    "routed_to": "target-service-name",
    "confidence": 0.95,
    "requester": "requester-service-name",
    "processing_time_ms": 245
  }
}
```

### Error Responses

**400 Bad Request** - Missing required fields:
```json
{
  "success": false,
  "message": "Missing required field: requester_service"
}
```

**404 Not Found** - No suitable service found:
```json
{
  "success": false,
  "message": "No suitable microservice found for this request",
  "query": "natural language query",
  "requester": "requester-service-name",
  "availableServices": [...]
}
```

**502 Bad Gateway** - Target service unavailable:
```json
{
  "success": false,
  "message": "Failed to communicate with target service 'target-service-name'",
  "error": "Request timeout after 30000ms",
  "requester": "requester-service-name",
  "routed_to": "target-service-name"
}
```

**503 Service Unavailable** - Target service not active:
```json
{
  "success": false,
  "message": "Target service 'target-service-name' is not active (status: pending_migration)",
  "requester": "requester-service-name"
}
```

---

## Request Flow

1. **Receive** request from requester microservice
2. **Extract** payload and convert to natural language query
3. **Use AI routing** to find the best target service (using existing AI routing logic)
4. **Forward** the complete request to target service's `/api/fill-content-metrics/` endpoint
5. **Receive** the response from target service
6. **Map** the response data to match the `response` template structure
7. **Return** the mapped response to requester

---

## Key Features

### 1. Payload-to-Query Conversion

The payload is automatically converted to a natural language query for AI routing:

**Example:**
- Input: `{ "action": "coding", "amount": 2, "difficulty": "medium" }`
- Output: `"coding, amount: 2, difficulty: medium"`

### 2. AI-Powered Routing

- Uses existing `aiRoutingService.routeRequest()` function
- Returns target service with confidence score
- Falls back to keyword-based routing if AI unavailable
- Only routes to services with status `"active"`

### 3. Request Forwarding

- Forwards complete request to target service's `/api/fill-content-metrics/` endpoint
- Adds headers: `X-Requester-Service`, `X-Routed-By: coordinator`
- 30-second timeout
- Proper error handling for network failures

### 4. Response Mapping

The response mapping logic:
- Extracts data from target service response (handles wrapped responses)
- Maps fields to match the `response` template structure
- Uses exact match first, then case-insensitive match
- Falls back to template default values if field not found
- If template is empty, returns all data from target service

**Mapping Priority:**
1. Exact field name match
2. Case-insensitive field name match
3. Template default value
4. First available field from target response (if template value is empty)

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `AI_ROUTING_ENABLED` | No | `false` | Enable AI routing (recommended: `true`) |
| `OPENAI_API_KEY` | No* | - | OpenAI API key (required for AI routing) |
| `AI_MODEL` | No | `gpt-4o-mini` | AI model to use |
| `AI_FALLBACK_ENABLED` | No | `true` | Enable fallback routing |

*Required when `AI_ROUTING_ENABLED=true`

---

## Testing Instructions

### Basic Request

```bash
curl -X POST http://localhost:3000/api/fill-content-metrics/ \
  -H "Content-Type: application/json" \
  -d '{
    "requester_service": "devlab",
    "payload": {
      "action": "coding",
      "amount": 2,
      "difficulty": "medium",
      "programming_language": "javascript"
    },
    "response": {
      "answer": ""
    }
  }'
```

### Empty Payload

```bash
curl -X POST http://localhost:3000/api/fill-content-metrics/ \
  -H "Content-Type: application/json" \
  -d '{
    "requester_service": "test-service",
    "payload": {},
    "response": {
      "answer": ""
    }
  }'
```

### Multiple Fields in Response Template

```bash
curl -X POST http://localhost:3000/api/fill-content-metrics/ \
  -H "Content-Type: application/json" \
  -d '{
    "requester_service": "user-service",
    "payload": {
      "action": "payment",
      "amount": 100.00
    },
    "response": {
      "transaction_id": "",
      "status": "",
      "amount": 0
    }
  }'
```

### Test Validation

```bash
# Test missing requester_service
curl -X POST http://localhost:3000/api/fill-content-metrics/ \
  -H "Content-Type: application/json" \
  -d '{
    "payload": { "action": "coding" },
    "response": { "answer": "" }
  }'

# Should return 400 with error message
```

### Deployment Tests

```bash
# Run deployment tests against live Railway instance
npm run test:deployment

# Or run all tests
npm run test:all
```

---

## Example Flow

**Request from DevLab service:**

```json
{
  "requester_service": "devlab",
  "payload": {
    "action": "coding",
    "amount": 2,
    "difficulty": "medium",
    "programming_language": "javascript"
  },
  "response": {
    "answer": ""
  }
}
```

**Coordinator processing:**

1. Converts payload to query: `"coding, amount: 2, difficulty: medium, programming_language: javascript"`
2. Uses AI routing → finds `exercises-service` (confidence: 0.95)
3. Forwards to: `http://exercises-service:5000/api/fill-content-metrics/`
4. Receives response from exercises-service
5. Maps response to fill the `answer` field
6. Returns to devlab

**Expected response:**

```json
{
  "success": true,
  "data": {
    "answer": "... content from exercises-service ..."
  },
  "metadata": {
    "routed_to": "exercises-service",
    "confidence": 0.95,
    "requester": "devlab",
    "processing_time_ms": 245
  }
}
```

---

## Metrics

The following metrics are tracked:

- **Unified Proxy Requests Total** (`coordinator_unified_proxy_requests_total`)
  - Counter metric tracking unified proxy requests

- **Unified Proxy Success** (`coordinator_unified_proxy_success_total`)
  - Counter metric tracking successful proxy requests

- **Unified Proxy Failures** (`coordinator_unified_proxy_failures_total`)
  - Counter metric tracking failed proxy requests

- **Unified Proxy Processing Time** (`coordinator_unified_proxy_processing_time_ms`)
  - Histogram metric tracking processing time

Access metrics via: `GET /metrics`

---

## Error Handling

The implementation includes comprehensive error handling for:

- ✅ Missing required fields (400)
- ✅ No suitable service found (404)
- ✅ Target service unavailable (502)
- ✅ Target service not active (503)
- ✅ Network timeouts (502)
- ✅ Response mapping failures (500)
- ✅ AI routing failures (502)

All errors are logged with context for debugging.

---

## Testing

### Test Coverage

- **Unit Tests:** `tests/unified-proxy.test.js` (33+ tests)
- **Deployment Tests:** `tests/deployment.test.js` (13 tests)
- **Coverage:** >80% line coverage, >75% branch coverage

### Test Categories

1. Request Validation (6 tests)
2. AI Routing (5 tests)
3. Service Discovery (3 tests)
4. Request Forwarding (4 tests)
5. Response Mapping (6 tests)
6. Integration (3 tests)
7. Error Handling (3 tests)
8. Performance (2 tests)
9. Logging (1 test)

### Run Tests

```bash
# Run all unified proxy tests
npm run test:unified-proxy

# Run deployment tests
npm run test:deployment

# Run with coverage
npm run test:coverage
```

---

## Future Enhancements

1. **Response Caching**
   - Cache responses for identical requests
   - Reduce load on target services
   - Configurable TTL

2. **Request Batching**
   - Batch multiple requests to same service
   - Reduce network overhead
   - Improve throughput

3. **Circuit Breaker**
   - Automatic circuit breaking for failing services
   - Graceful degradation
   - Automatic recovery

4. **Request Retry Logic**
   - Automatic retry with exponential backoff
   - Configurable retry policies
   - Retry on specific error types

5. **Response Transformation**
   - Advanced response transformation rules
   - Custom mapping functions
   - Data validation

6. **Rate Limiting**
   - Per-service rate limiting
   - Request throttling
   - Quota management

7. **Request/Response Logging**
   - Detailed request/response logging
   - Audit trail
   - Debugging support

8. **Metrics Dashboard**
   - Real-time metrics visualization
   - Performance monitoring
   - Alerting

---

## Related Documentation

- [Unified Proxy Implementation](../../UNIFIED_PROXY_IMPLEMENTATION.md)
- [AI Routing Guide](../../AI_ROUTING_GUIDE.md)
- [Service Registration Guide](../../MICROSERVICE_REGISTRATION_GUIDE.md)
- [Deployment Testing Guide](../../DEPLOYMENT_TESTING.md)
- [Test Guide](../../tests/TEST_GUIDE.md)

---

## Notes

- The endpoint is registered **before** the catch-all proxy route, so it takes precedence
- Only services with status `"active"` are considered for routing
- The response template can be an empty object `{}` - in this case, all data from the target service will be returned
- The payload can be an empty object `{}` - it will be converted to `"empty request"` for routing
- All microservices must implement the same endpoint: `/api/fill-content-metrics/`
- The Coordinator acts as the single gateway for all inter-service communication

