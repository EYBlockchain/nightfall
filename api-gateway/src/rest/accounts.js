import request from 'request';
import config from 'config';

const url = config.accounts.url;

const requestWrapper = options =>
  new Promise(function promiseHandler(resolve, reject) {
    request(options, function responseHandler(err, res, body) {
      if (err || res.statusCode === 500) {
        return reject(err || res.body);
      }
      return resolve(body);
    });
  });

/*
 * rest calls to accounts microservice
 */
export default {
  // create geth account.
  createAccount(password) {
    const options = {
      url: `${url}/account/new`,
      method: 'POST',
      json: true,
      body: { password },
    };
    return requestWrapper(options);
  },

  // unlock a geth account.
  unlockAccount(body) {
    const options = {
      url: `${url}/accounts/unlock`,
      method: 'POST',
      json: true,
      body,
    };
    return requestWrapper(options);
  },
};
