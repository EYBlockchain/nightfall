import request from 'request';
import config from 'config';

const url = config.get('authenticationApi.url');

const requestWrapper = options =>
  new Promise(function promiseHandler(resolve, reject) {
    request(options, function responseHandler(err, res, body) {
      if (err || res.statusCode === 500) {
        return reject(err || res.body);
      }
      return resolve(body);
    });
  });

export default {
  checkCorrectnessCoin(headers, body) {
    const options = {
      url: `${url}/coin/checkCorrectness`,
      method: 'POST',
      json: true,
      headers,
      body,
    };
    return requestWrapper(options);
  },
  checkCorrectnessToken(headers, body) {
    const options = {
      url: `${url}/token/checkCorrectness`,
      method: 'POST',
      json: true,
      headers,
      body,
    };
    return requestWrapper(options);
  },
  addNFTokenToDB(headers, body) {
    const options = {
      url: `${url}/database/nft`,
      method: 'POST',
      json: true,
      headers,
      body,
    };
    return requestWrapper(options);
  },
  addFTokenToDB(headers, body) {
    const options = {
      url: `${url}/database/ft/transaction`,
      method: 'POST',
      json: true,
      headers,
      body,
    };
    return requestWrapper(options);
  },
  addTokenCommitmentToDB(headers, body) {
    const options = {
      url: `${url}/database/token`,
      method: 'POST',
      json: true,
      headers,
      body,
    };
    return requestWrapper(options);
  },
  addCoinCommitmentToDB(headers, body) {
    const options = {
      url: `${url}/database/coin`,
      method: 'POST',
      json: true,
      headers,
      body,
    };
    return requestWrapper(options);
  },
};
