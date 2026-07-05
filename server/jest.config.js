module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  coveragePathIgnorePatterns: ['/node_modules/', '/tests/'],
  setupFiles: ['./tests/setup.js'],
  setupFilesAfterEnv: [],
  verbose: true,
  forceExit: true,
  detectOpenHandles: true,
  moduleNameMapper: {
    '^otplib$': '<rootDir>/tests/__mocks__/otplib.js'
  }
};
