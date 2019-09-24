module.exports = {
  extends: ['codfish', 'codfish/docker', 'codfish/dapp'],
  root: true,
  env: {
    node: true,
  },
  rules: {
    'no-console': 'off',
    'import/no-extraneous-dependencies': [
      'error', 
      {
        'devDependencies': ['integration-test/test.js', 'integration-test/testData.js'],
      },
    ],
  },
  env: {
    mocha: true,
  },
};
