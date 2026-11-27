const preset = require('jest-expo/jest-preset');

module.exports = {
  ...preset,
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['<rootDir>/src/**/*.ui.test.ts', '<rootDir>/src/**/*.ui.test.tsx'],
  testTimeout: 15000,
};
