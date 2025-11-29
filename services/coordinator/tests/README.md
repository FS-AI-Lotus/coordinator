# Test Suite - Unified Proxy Endpoint

## Overview

Comprehensive test suite for the `/api/fill-content-metrics/` unified proxy endpoint. This test suite covers all aspects of the endpoint including validation, routing, forwarding, mapping, and error handling.

---

## Quick Start

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run only unified proxy tests
npm run test:unified-proxy

# Run with coverage
npm run test:coverage
```

---

## Test Structure

```
tests/
├── unified-proxy.test.js    # Main test file (33+ tests)
├── mocks/
│   ├── mock-ai-routing.js   # Mock AI routing service
│   └── mock-services.js     # Mock microservices
├── helpers/
│   └── test-server.js      # Test server setup
├── setup/
│   └── jest.setup.js       # Jest configuration
├── README.md               # This file
├── TEST_GUIDE.md          # Detailed test guide
├── TEST_REPORT.md         # Test execution report
└── COVERAGE_REPORT.md     # Coverage statistics
```

---

## Test Categories

### ✅ 1. Request Validation (6 tests)
Tests input validation and error handling for invalid requests.

### ✅ 2. AI Routing (5 tests)
Tests AI-powered routing to find target services.

### ✅ 3. Service Discovery (3 tests)
Tests service lookup and status validation.

### ✅ 4. Request Forwarding (4 tests)
Tests forwarding requests to target services.

### ✅ 5. Response Mapping (6 tests)
Tests mapping target responses to requester templates.

### ✅ 6. Integration (3 tests)
End-to-end integration tests.

### ✅ 7. Error Handling (3 tests)
Tests error scenarios and error propagation.

### ✅ 8. Performance (2 tests)
Tests response times and concurrent requests.

### ✅ 9. Logging (1 test)
Tests logging functionality.

**Total: 33+ tests**

---

## Mock Services

The test suite includes 5 mock services:

1. **Mock Exercises Service** (Port 5001) - Coding/exercise responses
2. **Mock Payment Service** (Port 5002) - Payment/transaction responses
3. **Mock User Service** (Port 5003) - User/profile responses
4. **Mock Error Service** (Port 5004) - Error responses
5. **Mock Timeout Service** (Port 5005) - Timeout scenarios

---

## Documentation

- **[TEST_GUIDE.md](./TEST_GUIDE.md)** - How to run and maintain tests
- **[TEST_REPORT.md](./TEST_REPORT.md)** - Test execution summary
- **[COVERAGE_REPORT.md](./COVERAGE_REPORT.md)** - Coverage statistics

---

## Coverage Goals

- **Line Coverage:** >80% ✅
- **Branch Coverage:** >75% ✅
- **Function Coverage:** >90% ✅

---

## Success Criteria

- [x] All 9 test categories implemented
- [x] All tests pass successfully
- [x] Code coverage >80%
- [x] Mock services working correctly
- [x] Integration tests validate full flow
- [x] Error scenarios properly tested
- [x] Performance tests show acceptable times
- [x] Test documentation generated
- [x] Tests can run in CI/CD pipeline

---

## Running Tests

### All Tests
```bash
npm test
```

### Watch Mode
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

### Specific Test File
```bash
npm run test:unified-proxy
```

---

## Troubleshooting

### Port Conflicts
If you see port conflicts, ensure ports 5001-5005 are available:
```bash
# Check ports
netstat -ano | findstr :5001  # Windows
lsof -i :5001                 # Mac/Linux
```

### Tests Failing
1. Check that dependencies are installed: `npm install`
2. Verify mock services can start
3. Review error messages
4. Check test logs

### Timeout Issues
Some tests (timeout tests) may take up to 35 seconds. This is expected.

---

## Contributing

When adding new tests:
1. Follow existing test patterns
2. Add to appropriate category
3. Update documentation
4. Ensure tests pass
5. Maintain coverage >80%

---

## CI/CD Integration

Tests are designed to run in CI/CD pipelines:

```yaml
- name: Run tests
  run: npm test

- name: Generate coverage
  run: npm run test:coverage
```

---

## Next Steps

1. Run tests: `npm test`
2. Review coverage: `npm run test:coverage`
3. Read [TEST_GUIDE.md](./TEST_GUIDE.md) for details
4. Review [TEST_REPORT.md](./TEST_REPORT.md) for results

