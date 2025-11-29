# Test Suite Organization

## Directory Structure

The test suite is organized into logical categories for easy navigation and maintenance:

- **`routing/`** - AI routing and routing logic tests
  - Tests for AI-powered routing functionality
  - Routing scenario tests
  - Cascading fallback tests

- **`integration/`** - End-to-end integration tests
  - Full system integration tests
  - Dual-protocol tests (HTTP + gRPC)
  - Coordinator advanced tests
  - Railway endpoint tests

- **`grpc/`** - gRPC protocol tests
  - gRPC client tests
  - gRPC user query tests
  - Protocol-specific functionality

- **`fixtures/`** - Test data and mock files
  - JSON test data files
  - Mock service configurations
  - Test request/response examples

- **`utils/`** - Test utilities and helpers
  - Test summary utilities
  - Common test helpers
  - Shared test functions

- **`diagnostics/`** - Diagnostic and analysis scripts
  - Environment checking scripts
  - AI routing quality analysis
  - Diagnostic tools

- **`setup/`** - Setup scripts for test environments
  - Test service setup scripts
  - Environment configuration
  - Test data initialization

- **`archive/`** - Deprecated/one-time test scripts
  - Historical test scripts
  - One-time fix verification scripts
  - Deprecated test files

## Running Tests

### All Tests

```bash
# Run all tests (if test runner configured)
npm test
```

### Routing Tests

```bash
# AI routing tests
node test/routing/test-ai-routing.js

# Routing with services
node test/routing/test-ai-with-service.js

# Routing scenarios
node test/routing/test-routing-scenarios.js

# Cascading fallback
bash test/routing/test-cascading.sh
```

### Integration Tests

```bash
# Simple integration test
bash test/integration/test-simple.sh

# Dual protocol test
node test/integration/test-dual-protocol.js

# REST vs gRPC comparison
node test/integration/test-rest-vs-grpc.js

# Advanced coordinator tests
bash test/integration/test-coordinator-advanced.sh

# Railway endpoints
powershell test/integration/test-railway-endpoints.ps1

# Comprehensive AI test
node test/integration/comprehensive-ai-test.js
```

### gRPC Tests

```bash
# gRPC client test
node test/grpc/test-grpc-client.js

# gRPC user query test
node test/grpc/test-grpc-user-query.js
```

### Diagnostic Scripts

```bash
# Check environment and test
node test/diagnostics/check-env-and-test.js

# Analyze AI routing quality
node test/diagnostics/analyze-ai-routing-quality.js
```

### Setup Scripts

```bash
# Setup test services
node test/setup/setup-correct-two-stage.js
```

## Adding New Tests

1. **Determine test category** (routing, integration, grpc, etc.)
2. **Create test file** in appropriate directory
3. **Follow naming convention:** `test-[feature].js` or `test-[feature].sh`
4. **Update this README** if adding new category
5. **Add test data** to `fixtures/` if needed

## Test File Naming Conventions

- **JavaScript tests:** `test-[feature-name].js`
- **Shell scripts:** `test-[feature-name].sh`
- **PowerShell scripts:** `test-[feature-name].ps1`
- **Test fixtures:** `test-[data-type].json`

## Test Organization Principles

1. **By Functionality** - Group related tests together
2. **By Type** - Separate unit, integration, and e2e tests
3. **By Protocol** - Separate HTTP and gRPC tests
4. **By Purpose** - Separate tests, diagnostics, and setup scripts

## Notes

- Test files moved from root directory during cleanup (2025-01-XX)
- Some archived tests in `archive/` are historical and may not work with current codebase
- Diagnostic scripts are useful for troubleshooting but not part of regular test suite
- Setup scripts should be run before integration tests


