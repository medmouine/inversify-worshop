module.exports = (webpack) => ({
  files: [
    { pattern: './src/**/*.ts', load: false },
  ],

  tests: [
    './spec/tests/**/*.spec.ts',
  ],

  env: {
    type: 'node',
  },

  compilers: {
    '**/*.ts': webpack.compilers.typeScript({ useStandardDefaults: true }),
  },

  setup (wallaby) {
    const jestConfig = require('./package').jest || require('./jest.config');
    delete jestConfig.transform['^.+\\.tsx?$'];
    wallaby.testFramework.configure(jestConfig);
  },

  testFramework: './node_modules/.bin/jest',

  debug: true,
});
