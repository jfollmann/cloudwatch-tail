module.exports = {
  clearMocks: true,
  collectCoverageFrom: [
    '<rootDir>/src/**/*.js',
    '!<rootDir>/src/run.js',
    '!<rootDir>/src/rerun.js'
  ],
  setupFiles: [
    '<rootDir>/tests/.jest/setup.js'
  ],
  coverageThreshold: {
    global: {
      lines: 100,
      statements: 100,
      functions: 100
    }
  },
  coverageDirectory: 'coverage',
  coverageProvider: 'v8'
}
