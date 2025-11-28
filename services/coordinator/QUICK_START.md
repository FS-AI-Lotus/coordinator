# Quick Start Guide - Testing Coordinator Fixes

## Step 1: Install Dependencies
```bash
cd services/coordinator
npm install
```

## Step 2: Start the Service
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

The service will start on `http://localhost:3000`

## Step 3: Test the Fixes

### Option A: Run Automated Test Script
In a **new terminal** (keep the server running):
```bash
cd services/coordinator
node test/archive/test-register-fix.js
```

**Note:** This test script is archived. For current tests, see `test/README.md`.

### Option B: Manual Testing with cURL

**Test 1: GET /register (CI compatibility)**
```bash
curl http://localhost:3000/register
```
Expected: `200 OK` with JSON response

**Test 2: POST /register (simplified format)**
```bash
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"rag\", \"url\": \"https://ragmicroservice.up.railway.app\", \"grpc\": 50052}"
```
Expected: `201 Created` with `{"message": "Service registered", "serviceId": "..."}`

**Test 3: Check Health**
```bash
curl http://localhost:3000/health
```
Expected: `200 OK` with `{"status": "healthy", "registeredServices": 1, ...}`

**Test 4: POST /register with missing body (should fail)**
```bash
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d "{}"
```
Expected: `400 Bad Request`

## Step 4: Verify Service Starts Without Supabase

The service should start successfully even without Supabase environment variables. You'll see warnings in the logs but the service will run in in-memory mode.

## Docker Testing (Optional)

If you have Docker installed:

```bash
# Build the image
docker build -t coordinator:latest services/coordinator

# Run the container
docker run -d -p 3000:3000 --name coordinator_test coordinator:latest

# Wait a few seconds for startup
sleep 5

# Test endpoints
curl http://localhost:3000/register
curl -X POST http://localhost:3000/register -H "Content-Type: application/json" -d '{"name":"test","url":"https://test.com","grpc":50051}'
curl http://localhost:3000/health

# View logs
docker logs coordinator_test

# Cleanup
docker rm -f coordinator_test
```

## Troubleshooting

- **Port 3000 already in use?** Set `PORT=3001` environment variable
- **Module not found errors?** Run `npm install` again
- **Service crashes on startup?** Check the logs for specific errors

