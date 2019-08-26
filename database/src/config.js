/**
@module config.js
@author Liju Jose
@desc constants used by a nubmer of other modules
*/

let env = 'local'; // set the environment to local if not mentioned while starting the app
const props = {
  local: {
    mongo: {
      host: 'mongo',
      port: '27017',
      databaseName: 'nightfall',
      admin: 'admin',
      adminPassword: 'admin',
    },
    isLoggerEnable: true,
  },
  test: {
    mongo: {
      host: 'mongo_test',
      port: '27017',
      databaseName: 'nightfall_test',
      admin: 'admin',
      adminPassword: 'admin',
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
