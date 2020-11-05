module.exports = {
  extends: [require.resolve('eslint-config-codfish')].filter(Boolean),
  root: true,
  rules: {
    'no-console': 'off',
    'no-restricted-syntax': 'off',
    'no-plusplus': 'off',
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: ['integration-test/test.js', 'integration-test/testData.js'],
      },
    ],
  },
  env: {
    mocha: true,
  },
  globals: {
    BigInt: true,
  },
};
