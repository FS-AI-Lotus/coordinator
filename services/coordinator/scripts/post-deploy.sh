#!/bin/bash

# Post-Deployment Script for Railway
# This script runs after deployment to verify the service is working

set -e

echo "🚀 Post-Deployment Verification"
echo "================================"
echo ""

# Get Railway URL from environment or use default
RAILWAY_URL="${RAILWAY_URL:-https://coordinator-production-e0a0.up.railway.app}"

echo "📍 Testing against: $RAILWAY_URL"
echo ""

# Check if service is accessible
echo "🔍 Checking service health..."
HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$RAILWAY_URL/health" || echo "000")

if [ "$HEALTH_RESPONSE" = "200" ]; then
    echo "✅ Service is healthy"
else
    echo "⚠️  Service health check returned: $HEALTH_RESPONSE"
fi

echo ""

# Run deployment tests if in test environment
if [ "$NODE_ENV" != "production" ] || [ "$RUN_TESTS" = "true" ]; then
    echo "🧪 Running deployment tests..."
    export RAILWAY_URL="$RAILWAY_URL"
    npm run test:deployment || {
        echo "❌ Deployment tests failed"
        exit 1
    }
    echo "✅ Deployment tests passed"
else
    echo "⏭️  Skipping tests (production mode)"
fi

echo ""
echo "✅ Post-deployment verification complete"

