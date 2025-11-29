# Deployment Testing Guide

## Overview

This guide explains how to test the deployed Coordinator service on Railway after deployment.

**Railway URL:** https://coordinator-production-e0a0.up.railway.app

---

## Quick Start

### Run Deployment Tests Locally

```bash
cd services/coordinator

# Set Railway URL (optional, defaults to production URL)
export RAILWAY_URL=https://coordinator-production-e0a0.up.railway.app

# Run deployment tests
npm run test:deployment
```

### Run All Tests (Unit + Deployment)

```bash
npm run test:all
```

---

## Test Scripts

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run test:deployment` | Run tests against live Railway instance |
| `npm run test:all` | Run both unit tests and deployment tests |
| `npm run postdeploy` | Post-deployment verification script |

---

## Deployment Test File

### Location
`tests/deployment.test.js`

### What It Tests

1. **Health Checks**
   - Root endpoint accessibility
   - Health endpoint response
   - Service status verification

2. **Unified Proxy Endpoint**
   - Request validation
   - Error handling
   - Response structure

3. **Service Discovery**
   - Services endpoint
   - Registry endpoint

4. **AI Routing**
   - Route endpoint functionality

5. **Error Handling**
   - Invalid requests
   - Non-existent endpoints

6. **Performance**
   - Response times

---

## Post-Deployment Script

### Automatic Testing

The `scripts/test-deployment.js` script runs automatically after deployment:

1. Checks service health
2. Runs deployment tests
3. Reports results

### Manual Execution

```bash
node scripts/test-deployment.js
```

---

## Railway Integration

### Post-Deploy Hook

Railway can run tests after deployment using the `railway.json` configuration:

```json
{
  "postDeploy": {
    "command": "cd services/coordinator && node scripts/test-deployment.js"
  }
}
```

### Environment Variables

Set in Railway dashboard:
- `RAILWAY_URL` - Your Railway service URL (optional, has default)
- `RUN_TESTS` - Set to "true" to enable tests in production

---

## GitHub Actions

### Automated Testing

The `.github/workflows/test-deployment.yml` workflow:
- Runs on push to main/master
- Runs unit tests
- Runs deployment tests against Railway
- Generates coverage reports

### Setup

1. Add Railway URL to GitHub Secrets:
   - Go to Repository → Settings → Secrets
   - Add `RAILWAY_URL` secret

2. Workflow runs automatically on push

---

## Test Results

### Expected Output

```
🚀 Post-Deployment Test Script
============================================================
📍 Testing against: https://coordinator-production-e0a0.up.railway.app

🔍 Checking service health...
✅ Service is healthy and accessible

🧪 Running deployment tests...

PASS tests/deployment.test.js
  Deployment Tests - Railway Instance
    Health Check
      ✓ should respond to root endpoint (1234ms)
      ✓ should have unified proxy endpoint listed (567ms)
      ✓ should respond to health endpoint (890ms)
    Unified Proxy Endpoint - Live Tests
      ✓ should reject request without requester_service (234ms)
      ✓ should reject request without response template (345ms)
      ✓ should accept valid request structure (1234ms)
    ...

Test Suites: 1 passed, 1 total
Tests:       15+ passed, 15+ total

✅ Deployment tests passed!
```

---

## Troubleshooting

### Service Not Accessible

If tests fail with connection errors:

1. **Check Railway Status**
   - Verify service is deployed
   - Check Railway dashboard for errors
   - Verify service URL is correct

2. **Check Network**
   - Ensure Railway URL is accessible
   - Check firewall settings
   - Verify DNS resolution

3. **Check Service Health**
   ```bash
   curl https://coordinator-production-e0a0.up.railway.app/health
   ```

### Tests Timing Out

If tests timeout:

1. Increase timeout in test file
2. Check Railway service performance
3. Verify service is not overloaded

### Authentication Issues

If you see authentication errors:

1. Check Railway environment variables
2. Verify API keys are set
3. Check service permissions

---

## Continuous Testing

### After Every Deployment

1. Railway runs post-deploy script automatically
2. GitHub Actions runs on push
3. Manual testing: `npm run test:deployment`

### Monitoring

- Check Railway logs for test results
- Review GitHub Actions runs
- Monitor test success rate

---

## Best Practices

1. **Run Tests Before Deployment**
   ```bash
   npm test  # Unit tests
   ```

2. **Run Tests After Deployment**
   ```bash
   npm run test:deployment  # Deployment tests
   ```

3. **Monitor Test Results**
   - Review test output
   - Check for failures
   - Investigate issues

4. **Update Tests**
   - Add tests for new features
   - Update tests for API changes
   - Maintain test coverage

---

## Test Coverage

### Deployment Tests Cover

- ✅ Service accessibility
- ✅ Endpoint availability
- ✅ Request validation
- ✅ Error handling
- ✅ Response structure
- ✅ Performance

### Not Covered (Use Unit Tests)

- Mock services
- Internal logic
- Edge cases
- Detailed error scenarios

---

## Next Steps

1. **Run Tests**
   ```bash
   npm run test:deployment
   ```

2. **Review Results**
   - Check test output
   - Verify all tests pass
   - Investigate failures

3. **Monitor**
   - Set up alerts
   - Review logs
   - Track test success rate

---

## Support

For issues:
1. Check Railway service status
2. Review test logs
3. Verify environment variables
4. Check service health endpoint

---

**Last Updated:** 2025-01-XX  
**Railway URL:** https://coordinator-production-e0a0.up.railway.app

