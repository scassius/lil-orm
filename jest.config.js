module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  transformIgnorePatterns: [
    '/node_modules/',
    '^.+\\.tsx?$',
    '<rootDir>/src/__tests__/(?!user\\.entity)\\.ts$',
  ],
};
