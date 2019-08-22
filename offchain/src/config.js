let env = 'local'; // set the environment to local if not mentioned while starting the app
const props = {
  local: {
    database: {
      host: 'http://database',
      port: '80',
    },
    offchain: {
      app: {
        host: 'http://offchain',
        port: '80',
      },
      rpc: {
        host: 'http://ganache',
        port: '8545',
      },
    },
    authenticationApi: {
      host: 'http://api-gateway',
      port: '80',
    },
  },
  test: {
    database: {
      host: 'http://database_test',
      port: '80',
    },
    offchain: {
      app: {
        host: 'http://offchain_test',
        port: '80',
      },
      rpc: {
        host: 'http://ganache_test',
        port: '8545',
      },
    },
    authenticationApi: {
      host: 'http://api-gateway_test',
      port: '80',
    },
  },
};

/**
 * Set the environment
 * @param { string } environment - environment of app
 */
export function setEnv(environment) {
  if (props[environment]) {
    env = environment;
  }
}
setEnv(process.env.NODE_ENV);

/**
 * get the appropriate environment config
 */
export const getProps = () => props[env];
