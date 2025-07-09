export const preset = 'jest-preset-angular';
export const setupFilesAfterEnv = ['<rootDir>/setup-jest.ts'];
export const testPathIgnorePatterns = ['/node_modules/', '/dist/'];
export const moduleNameMapper = {
  '^@app/(.*)': '<rootDir>/src/app/$1',
};
