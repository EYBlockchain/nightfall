import request from 'request';
import { getProps } from '../config';

const { authenticationApi } = getProps();
const host = `${authenticationApi.host}:${authenticationApi.port}`;

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
      url: `${host}/coin/checkCorrectness`,
      method: 'POST',
      json: true,
      headers,
      body,
    };
    return requestWrapper(options);
  },
  checkCorrectnessToken(headers, body) {
    const options = {
      url: `${host}/token/checkCorrectness`,
      method: 'POST',
      json: true,
      headers,
      body,
    };
    return requestWrapper(options);
  },
  addNFTokenToDB(headers, body) {
    const options = {
      url: `${host}/database/nft`,
      method: 'POST',
      json: true,
      headers,
      body,
    };
    return requestWrapper(options);
  },
  addFTokenToDB(headers, body) {
    const options = {
      url: `${host}/database/ft/transaction`,
      method: 'POST',
      json: true,
      headers,
      body,
    };
    return requestWrapper(options);
  },
  addTokenCommitmentToDB(headers, body) {
    const options = {
      url: `${host}/database/token`,
      method: 'POST',
      json: true,
      headers,
      body,
    };
    return requestWrapper(options);
  },
  addCoinCommitmentToDB(headers, body) {
    const options = {
      url: `${host}/database/coin`,
      method: 'POST',
      json: true,
      headers,
      body,
    };
    return requestWrapper(options);
  },
};
