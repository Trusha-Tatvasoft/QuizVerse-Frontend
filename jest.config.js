export const preset = 'jest-preset-angular';
export const setupFilesAfterEnv = ['<rootDir>/setup-jest.ts'];
export const testPathIgnorePatterns = ['/node_modules/', '/dist/'];
export const moduleNameMapper = {
  '^@app/(.*)': '<rootDir>/src/app/$1',
  '^chart.js$': '<rootDir>/__mocks__/chart.js',
  '^ng2-charts$': '<rootDir>/__mocks__/ng2-charts.js'
};