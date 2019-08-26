import request from 'request';
import { getProps } from '../config/config';

const { zkp } = getProps();
const host = `${zkp.host}:${zkp.port}`;

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
 * rest calls to zkp microservice
 */
export default {
  // load new vk
  loadVks(body, headers) {
    const options = {
      url: `${host}/vk`,
      method: 'POST',
      json: true,
      headers: {
        address: headers.address,
        password: headers.password,
      },
      body,
    };
    return requestWrapper(options);
  },

  // mint non-fungible token commitment
  mintToken({ address }, body) {
    const options = {
      url: `${host}/token/mint`,
      method: 'POST',
      json: true,
      headers: { address },
      body,
    };
    return requestWrapper(options);
  },

  // transfer non-fungible token commitment
  spendToken({ address }, body) {
    const options = {
      url: `${host}/token/transfer`,
      method: 'POST',
      json: true,
      headers: { address },
      body,
    };
    return requestWrapper(options);
  },

  // burn non-fungible token commitment
  burnToken({ address }, body) {
    const options = {
      url: `${host}/token/burn`,
      method: 'POST',
      json: true,
      headers: { address },
      body,
    };
    return requestWrapper(options);
  },

  // mint fungible token commitment
  mintCoin({ address }, body) {
    const options = {
      url: `${host}/coin/mint`,
      method: 'POST',
      json: true,
      headers: { address },
      body,
    };
    return requestWrapper(options);
  },

  // transfer fungible token commitment
  transferCoin({ address }, body) {
    const options = {
      url: `${host}/coin/transfer`,
      method: 'POST',
      json: true,
      headers: { address },
      body,
    };
    return requestWrapper(options);
  },

  // burn fungible token commitment
  burnCoin(body, { address }) {
    const options = {
      url: `${host}/coin/burn`,
      method: 'POST',
      json: true,
      headers: { address },
      body,
    };
    return requestWrapper(options);
  },

  // mint non-fungible token
  mintNFToken({ address }, body) {
    const options = {
      url: `${host}/nft/mint`,
      method: 'POST',
      json: true,
      headers: { address },
      body,
    };
    return requestWrapper(options);
  },

  // transfer non-fungible token
  transferNFToken({ address }, body) {
    const options = {
      url: `${host}/nft/transfer`,
      method: 'POST',
      json: true,
      headers: { address },
      body,
    };
    return requestWrapper(options);
  },

  // burn non-fungible token
  burnNFToken({ address }, body) {
    const options = {
      url: `${host}/nft/burn`,
      method: 'POST',
      json: true,
      headers: { address },
      body,
    };
    return requestWrapper(options);
  },

  // mint fungible token
  mintFToken({ address }, body) {
    const options = {
      url: `${host}/ft/mint`,
      method: 'POST',
      json: true,
      headers: { address },
      body,
    };
    return requestWrapper(options);
  },

  // transfer fungible token
  transferFToken({ address }, body) {
    const options = {
      url: `${host}/ft/transfer`,
      method: 'POST',
      json: true,
      headers: { address },
      body,
    };
    return requestWrapper(options);
  },

  // burn fungible token
  burnFToken({ address }, body) {
    const options = {
      url: `${host}/ft/burn`,
      method: 'POST',
      json: true,
      headers: { address },
      body,
    };
    return requestWrapper(options);
  },

  // check correctness for non-fungible token commitment once received by whisper listener of bob.
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

  // check correctness for fungible token commitment once received by whisper listener of bob.
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

  // set new non-fungible commitment token shield for user address
  setTokenShield({ address }, body) {
    const options = {
      url: `${host}/token/shield`,
      method: 'POST',
      json: true,
      headers: { address },
      body,
    };
    return requestWrapper(options);
  },

  // get non-fungible commitment token shield address for user address
  getTokenShield({ address }) {
    const options = {
      url: `${host}/token/shield`,
      method: 'GET',
      json: true,
      headers: { address },
    };
    return requestWrapper(options);
  },

  // remove non-fungible commitment token shield address for user address
  unSetTokenShield({ address }) {
    const options = {
      url: `${host}/token/shield`,
      method: 'DELETE',
      json: true,
      headers: { address },
    };
    return requestWrapper(options);
  },
  // set new fungible commitment token shield for user address
  setCoinShield({ address }, body) {
    const options = {
      url: `${host}/coin/shield`,
      method: 'POST',
      json: true,
      headers: { address },
      body,
    };
    return requestWrapper(options);
  },

  // get ungible commitment token shield address for user address
  getCoinShield({ address }) {
    const options = {
      url: `${host}/coin/shield`,
      method: 'GET',
      json: true,
      headers: { address },
    };
    return requestWrapper(options);
  },

  // remove ungible commitment token shield address for user address
  unSetCoinShield({ address }) {
    const options = {
      url: `${host}/coin/shield`,
      method: 'DELETE',
      json: true,
      headers: { address },
    };
    return requestWrapper(options);
  },
};
