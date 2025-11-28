#!/bin/bash
# Simple curl-based test script for WSL
# Run: bash test-simple.sh

BASE_URL="http://localhost:3000"
PASSED=0
FAILED=0

echo "🧪 Testing Coordinator Service Fixes"
echo "======================================"
echo ""

# Test 1: GET /register
echo "Test 1: GET /register (CI compatibility)"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/register")
if [ "$STATUS" = "200" ]; then
    echo "✅ PASS: GET /register returns 200"
    PASSED=$((PASSED + 1))
else
    echo "❌ FAIL: Expected 200, got $STATUS"
    FAILED=$((FAILED + 1))
fi
echo ""

# Test 2: POST /register
echo "Test 2: POST /register with simplified format"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/register" \
  -H "Content-Type: application/json" \
  -d '{"name":"rag","url":"https://ragmicroservice.up.railway.app","grpc":50052}')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "201" ]; then
    echo "✅ PASS: POST /register returns 201"
    echo "   Response: $BODY"
    PASSED=$((PASSED + 1))
else
    echo "❌ FAIL: Expected 201, got $HTTP_CODE"
    echo "   Response: $BODY"
    FAILED=$((FAILED + 1))
fi
echo ""

# Test 3: POST /register with empty body
echo "Test 3: POST /register with missing body"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/register" \
  -H "Content-Type: application/json" \
  -d '{}')
if [ "$STATUS" = "400" ]; then
    echo "✅ PASS: POST /register with missing body returns 400"
    PASSED=$((PASSED + 1))
else
    echo "❌ FAIL: Expected 400, got $STATUS"
    FAILED=$((FAILED + 1))
fi
echo ""

# Test 4: GET /health
echo "Test 4: GET /health after registration"
sleep 0.5
HEALTH=$(curl -s "$BASE_URL/health")
REGISTERED=$(echo "$HEALTH" | grep -o '"registeredServices":[0-9]*' | grep -o '[0-9]*')
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/health")

if [ "$STATUS" = "200" ] && [ -n "$REGISTERED" ] && [ "$REGISTERED" -gt 0 ]; then
    echo "✅ PASS: /health shows registeredServices = $REGISTERED"
    PASSED=$((PASSED + 1))
else
    echo "❌ FAIL: Expected registeredServices > 0, got $REGISTERED"
    FAILED=$((FAILED + 1))
fi
echo ""

# Summary
echo "======================================"
echo "Tests Passed: $PASSED"
echo "Tests Failed: $FAILED"
echo "Total: $((PASSED + FAILED))"
echo "======================================"

if [ $FAILED -eq 0 ]; then
    echo ""
    echo "🎉 All tests passed!"
    exit 0
else
    echo ""
    echo "❌ Some tests failed"
    exit 1
fi

