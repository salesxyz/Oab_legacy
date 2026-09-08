/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['<rootDir>/tests/**/*.test.ts'],
  setupFiles: ['<rootDir>/tests/setupEnv.ts'],
  globalSetup: '<rootDir>/tests/globalSetup.ts',
  testTimeout: 20000,
  verbose: true,
};
