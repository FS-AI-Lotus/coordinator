#!/bin/bash

# Quick test script for WSL
# Run: bash RUN_TESTS_WSL.sh

echo "🧪 Testing Coordinator Service Fixes"
echo "======================================"
echo ""

# Check if we're in the right directory
if [ ! -f "test/archive/test-register-fix.js" ]; then
    echo "❌ Error: test/archive/test-register-fix.js not found"
    echo "Please run this script from: services/coordinator/"
    echo ""
    echo "Try:"
    echo "  cd services/coordinator"
    echo "  bash RUN_TESTS_WSL.sh"
    exit 1
fi

# Check if service is running
echo "Checking if service is running on http://localhost:3000..."
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ Service is running"
    echo ""
    node test/archive/test-register-fix.js
else
    echo "❌ Service is not running!"
    echo ""
    echo "Please start the service first:"
    echo "  cd services/coordinator"
    echo "  npm start"
    echo ""
    echo "Then in another terminal, run:"
    echo "  cd services/coordinator"
    echo "  node test/archive/test-register-fix.js"
    exit 1
fi

