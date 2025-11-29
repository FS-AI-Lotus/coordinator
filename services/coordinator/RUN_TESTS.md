# Run Tests - Comprehensive Guide

## Test Types Available

### 1. Unit Tests (Local)
Tests that run against local code with mocks:
```bash
npm test
```

### 2. Deployment Tests (Basic)
Basic validation of live production instance:
```bash
npm run test:deployment
```

### 3. Post-Deployment Tests (Comprehensive) ⭐ NEW
Comprehensive validation of production including AI routing and unified proxy:
```bash
npm run test:post-deployment
```

---

## Quick Start - Post-Deployment Tests

### Option 1: Using npm Script (Recommended)

```bash
cd services/coordinator
npm run test:post-deployment
```

### Option 2: Run with Node Directly

```bash
cd services/coordinator
node node_modules/jest/bin/jest.js tests/post-deployment.test.js --testTimeout=60000
```

### Option 3: Run Specific Test Suites

```bash
# Health & Connectivity only
node node_modules/jest/bin/jest.js tests/post-deployment.test.js -t "Health & Connectivity"

# AI Routing only
node node_modules/jest/bin/jest.js tests/post-deployment.test.js -t "AI Routing"

# Unified Proxy only
node node_modules/jest/bin/jest.js tests/post-deployment.test.js -t "Unified Proxy"
```

---

## What Post-Deployment Tests Cover

### ✅ Health & Connectivity
- Root endpoint response
- Health check endpoint
- Endpoint listing

### ✅ Service Registration & Discovery
- List all registered services
- Registry alias endpoint
- Service registration
- Service details structure

### ✅ AI Routing Functionality
- Basic routing with query
- Routing with intent parameter
- Single/multiple strategy routing
- Routing metadata
- Context-aware routing
- Empty services handling

### ✅ Unified Proxy Endpoint
- Request validation
- Valid request handling
- Complex payload structures
- Error handling
- Routing metadata in responses

### ✅ Integration Scenarios
- End-to-end flows
- Consistency across requests
- Concurrent request handling

### ✅ Error Handling & Resilience
- Invalid JSON handling
- Malformed requests
- Large payloads
- Special characters

### ✅ Performance & Reliability
- Response time validation
- Timeout handling
- Rapid sequential requests

### ✅ API Contract Validation
- Consistent response structures
- Error response format

---

## Configuration

### Environment Variable (Optional)

```bash
export RAILWAY_URL=https://coordinator-production-e0a0.up.railway.app
```

If not set, defaults to: `https://coordinator-production-e0a0.up.railway.app`

### Timeouts

- **Standard Tests**: 30 seconds
- **AI Routing Tests**: 45 seconds
- **Overall Suite**: 60 seconds

---

## Manual Quick Check

Test the health endpoint:

```bash
curl https://coordinator-production-e0a0.up.railway.app/health
```

Test the unified proxy endpoint:

```bash
curl -X POST https://coordinator-production-e0a0.up.railway.app/api/fill-content-metrics/ \
  -H "Content-Type: application/json" \
  -d '{
    "requester_service": "test",
    "payload": {"action": "coding"},
    "response": {"answer": ""}
  }'
```

Test AI routing:

```bash
curl -X POST https://coordinator-production-e0a0.up.railway.app/route \
  -H "Content-Type: application/json" \
  -d '{
    "query": "process payment",
    "routing": {"strategy": "single"}
  }'
```

---

## Expected Test Results

All tests should pass if:
- ✅ Coordinator service is running and accessible
- ✅ Network connectivity is stable
- ✅ AI routing is configured (or fallback is enabled)
- ✅ Services may or may not be registered (tests handle both cases)

### Status Code Expectations

Tests accept multiple valid status codes:
- **200**: Success
- **400**: Bad request (validation errors)
- **404**: Not found (no services, no route)
- **502**: Bad gateway (AI routing unavailable, target service unavailable)
- **503**: Service unavailable (target service not active)

---

## Troubleshooting

### Connection Timeout
- Verify the `RAILWAY_URL` is correct
- Check network connectivity
- Ensure the Coordinator service is running

### AI Routing Timeouts
- AI routing may take longer in production
- Check if `OPENAI_API_KEY` is configured
- Verify fallback routing is enabled

### Test Failures
- Review error messages for specific failures
- Check Coordinator logs for detailed errors
- Verify environment variables are set correctly

### Debug Mode

Run tests with verbose output:

```bash
node node_modules/jest/bin/jest.js tests/post-deployment.test.js --verbose --testTimeout=60000
```

---

## Documentation

- **[Post-Deployment Test Guide](./tests/POST_DEPLOYMENT_TEST_GUIDE.md)** - Comprehensive guide
- **[Test Guide](./tests/TEST_GUIDE.md)** - General testing documentation
- **[Deployment Tests](./tests/deployment.test.js)** - Basic deployment validation

---

**Ready to test?** Run `npm run test:post-deployment` to validate your production deployment!

