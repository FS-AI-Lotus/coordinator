#!/usr/bin/env node

/**
 * Post-Deployment Test Script
 * Runs tests against the deployed Railway instance
 */

const { execSync } = require('child_process');
const https = require('https');

const RAILWAY_URL = process.env.RAILWAY_URL || 'https://coordinator-production-e0a0.up.railway.app';

console.log('🚀 Post-Deployment Test Script');
console.log('='.repeat(60));
console.log(`📍 Testing against: ${RAILWAY_URL}`);
console.log('');

// Check if service is accessible
function checkServiceHealth() {
  return new Promise((resolve, reject) => {
    const url = new URL(RAILWAY_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: '/health',
      method: 'GET',
      timeout: 10000
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Service is healthy and accessible');
          resolve(true);
        } else {
          console.log(`⚠️  Service returned status ${res.statusCode}`);
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      console.log(`❌ Service health check failed: ${error.message}`);
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      console.log('❌ Service health check timed out');
      reject(new Error('Timeout'));
    });

    req.end();
  });
}

// Run deployment tests
async function runDeploymentTests() {
  try {
    console.log('🔍 Checking service health...');
    await checkServiceHealth();
    console.log('');

    console.log('🧪 Running deployment tests...');
    console.log('');

    // Set Railway URL for tests
    process.env.RAILWAY_URL = RAILWAY_URL;

    // Run deployment tests
    try {
      execSync('npm run test:deployment', {
        stdio: 'inherit',
        env: { ...process.env, RAILWAY_URL }
      });
      console.log('');
      console.log('✅ Deployment tests passed!');
      process.exit(0);
    } catch (error) {
      console.log('');
      console.log('❌ Deployment tests failed');
      console.log('Error:', error.message);
      process.exit(1);
    }
  } catch (error) {
    console.log('');
    console.log('❌ Pre-test health check failed');
    console.log('Error:', error.message);
    console.log('');
    console.log('⚠️  Continuing with tests anyway...');
    console.log('');

    // Still try to run tests
    try {
      execSync('npm run test:deployment', {
        stdio: 'inherit',
        env: { ...process.env, RAILWAY_URL }
      });
    } catch (testError) {
      console.log('');
      console.log('❌ Deployment tests failed');
      process.exit(1);
    }
  }
}

// Main execution
if (require.main === module) {
  runDeploymentTests();
}

module.exports = { runDeploymentTests, checkServiceHealth };

