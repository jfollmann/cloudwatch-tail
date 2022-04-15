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
  coverageDirectory: 'coverage',
  coverageProvider: 'v8'
}
