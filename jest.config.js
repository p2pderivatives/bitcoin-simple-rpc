module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/**/*.test.ts'],
  reporters: ['default'],
  setupFilesAfterEnv: ['./jest.setup.js'],
}
