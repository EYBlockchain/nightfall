const NodeEnvironment = require('jest-environment-node');

module.exports = class CustomEnvironment extends NodeEnvironment {
  /* eslint-disable no-useless-constructor */
  constructor(config) {
    super(config);
  }

  async setup() {
    await super.setup();
    await this.global.loadVkIds();
  }

  async teardown() {
    await super.teardown();
  }

  runScript(script) {
    return super.runScript(script);
  }
};
