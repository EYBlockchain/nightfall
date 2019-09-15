let env = 'local'; // set the environment to local if not mentioned while starting the app
const props = {
  local: {
    database: {
      host: process.env.DATABASE_HOST,
      port: process.env.DATABASE_PORT,
    },
    offchain: {
      app: {
        host: process.env.OFFCHAIN_HOST,
        port: process.env.OFFCHAIN_PORT,
      },
      rpc: {
        host: process.env.BLOCKCHAIN_HOST,
        port: process.env.BLOCKCHAIN_PORT,
      },
    },
    authenticationApi: {
      host: process.env.AUTHENTICATION_API_HOST,
      port: process.env.AUTHENTICATION_API_PORT,
    },
  },
  test: {
    database: {
      host: process.env.DATABASE_HOST,
      port: process.env.DATABASE_PORT,
    },
    offchain: {
      app: {
        host: process.env.OFFCHAIN_HOST,
        port: process.env.OFFCHAIN_PORT,
      },
      rpc: {
        host: process.env.BLOCKCHAIN_HOST,
        port: process.env.BLOCKCHAIN_PORT,
      },
    },
    authenticationApi: {
      host: process.env.AUTHENTICATION_API_HOST,
      port: process.env.AUTHENTICATION_API_PORT,
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
