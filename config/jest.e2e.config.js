// biome-ignore lint/style/noDefaultExport: <explanation>
export default {
  clearMocks: true,
  maxWorkers: '50%',
  rootDir: '..',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/__tests__/**/*.spec.ts'],
  transform: {
    '.*\\.(j|t)sx?$': '@swc/jest',
  },
  transformIgnorePatterns: [],
}
