// Jest setup file
// This runs before all tests

// Suppress console logs during tests (optional - uncomment if needed)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
//   error: jest.fn(),
// };

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.AI_ROUTING_ENABLED = 'true';
process.env.AI_FALLBACK_ENABLED = 'true';
process.env.AI_MODEL = 'gpt-4o-mini';
process.env.PORT = '3000';

// Mock environment variables that might not be set in tests
if (!process.env.OPENAI_API_KEY) {
  process.env.OPENAI_API_KEY = 'test-key';
}

