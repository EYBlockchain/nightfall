let env = 'local'; // set the environment to local if not mentioned while starting the app
const props = {
  local: {
    HASHLENGTH: 8, // expected length of a hash in bytes
    accounts: {
      host: process.env.ACCOUNTS_HOST,
      port: process.env.ACCOUNTS_PORT,
    },
    zkp: {
      host: process.env.ZKP_HOST,
      port: process.env.ZKP_PORT,
    },
    database: {
      host: process.env.DATABASE_HOST,
      port: process.env.DATABASE_PORT,
    },
    offchain: {
      host: process.env.OFFCHAIN_HOST,
      port: process.env.OFFCHAIN_PORT,
    },
    isLoggerEnable: true,
  },
  test: {
    HASHLENGTH: 8, // expected length of a hash in bytes
    accounts: {
      host: process.env.ACCOUNTS_HOST,
      port: process.env.ACCOUNTS_PORT,
    },
    zkp: {
      host: process.env.ZKP_HOST,
      port: process.env.ZKP_PORT,
    },
    database: {
      host: process.env.DATABASE_HOST,
      port: process.env.DATABASE_PORT,
    },
    offchain: {
      host: process.env.OFFCHAIN_HOST,
      port: process.env.OFFCHAIN_PORT,
    },
    isLoggerEnable: true,
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
