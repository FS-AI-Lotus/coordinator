#!/usr/bin/env node

/**
 * Quick script to run deployment tests
 * Can be run directly with: node run-deployment-tests.js
 */

const { execSync } = require('child_process');

console.log('🧪 Running Deployment Tests');
console.log('='.repeat(60));
console.log('');

try {
  // Set Railway URL
  process.env.RAILWAY_URL = process.env.RAILWAY_URL || 'https://coordinator-production-e0a0.up.railway.app';
  
  console.log(`📍 Testing against: ${process.env.RAILWAY_URL}`);
  console.log('');

  // Run Jest tests
  execSync('npx jest tests/deployment.test.js --testTimeout=30000', {
    stdio: 'inherit',
    env: process.env
  });

  console.log('');
  console.log('✅ Deployment tests completed successfully!');
} catch (error) {
  console.log('');
  console.log('❌ Deployment tests failed');
  process.exit(1);
}

