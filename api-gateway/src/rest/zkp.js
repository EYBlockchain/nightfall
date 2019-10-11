import request from 'request';
import config from 'config';

const url = config.get('zkp.url');

const requestWrapper = options =>
  new Promise(function promiseHandler(resolve, reject) {
    request(options, function responseHandler(err, res, body) {
      if (err || res.statusCode !== 200) {
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
      url: `${url}/vk`,
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
      url: `${url}/mintNFTCommitment`,
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
      url: `${url}/transferNFTCommitment`,
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
      url: `${url}/burnNFTCommitment`,
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
      url: `${url}/mintFTCommitment`,
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
      url: `${url}/transferFTCommitment`,
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
      url: `${url}/burnFTCommitment`,
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
      url: `${url}/mintNFToken`,
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
      url: `${url}/transferNFToken`,
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
      url: `${url}/burnNFToken`,
      method: 'POST',
      json: true,
      headers: { address },
      body,
    };
    return requestWrapper(options);
  },

  // get non-fungible token address
  getNFTokenAddress({ address }) {
    const options = {
      url: `${url}/getNFTokenContractAddress`,
      method: 'GET',
      json: true,
      headers: { address },
    };
    return requestWrapper(options);
  },

  // get non-fungible token information
  getNFTokenInfo({ address }) {
    const options = {
      url: `${url}/getNFTokenInfo`,
      method: 'GET',
      json: true,
      headers: { address },
    };
    return requestWrapper(options);
  },

  // mint fungible token
  mintFToken({ address }, body) {
    const options = {
      url: `${url}/mintFToken`,
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
      url: `${url}/transferFToken`,
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
      url: `${url}/burnFToken`,
      method: 'POST',
      json: true,
      headers: { address },
      body,
    };
    return requestWrapper(options);
  },

  // get fungible token address
  getFTokenAddress({ address }) {
    const options = {
      url: `${url}/getFTokenContractAddress`,
      method: 'GET',
      json: true,
      headers: { address },
    };
    return requestWrapper(options);
  },

  // get fungible token information
  getFTokenInfo({ address }) {
    const options = {
      url: `${url}/getFTokenInfo`,
      method: 'GET',
      json: true,
      headers: { address },
    };
    return requestWrapper(options);
  },

  // check correctness for non-fungible token commitment once received by whisper listener of bob.
  checkCorrectnessToken(headers, body) {
    const options = {
      url: `${url}/checkCorrectnessForNFTCommitment`,
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
      url: `${url}/checkCorrectnessForFTCommitment`,
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
      url: `${url}/setNFTCommitmentShieldContractAddress`,
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
      url: `${url}/getNFTCommitmentShieldContractAddress`,
      method: 'GET',
      json: true,
      headers: { address },
    };
    return requestWrapper(options);
  },

  // remove non-fungible commitment token shield address for user address
  unSetTokenShield({ address }) {
    const options = {
      url: `${url}/removeNFTCommitmentshield`,
      method: 'DELETE',
      json: true,
      headers: { address },
    };
    return requestWrapper(options);
  },
  // set new fungible commitment token shield for user address
  setCoinShield({ address }, body) {
    const options = {
      url: `${url}/setFTokenShieldContractAddress`,
      method: 'POST',
      json: true,
      headers: { address },
      body,
    };
    return requestWrapper(options);
  },

  // get fungible commitment token shield contract address for user address
  getCoinShield({ address }) {
    const options = {
      url: `${url}/getFTokenShieldContractAddress`,
      method: 'GET',
      json: true,
      headers: { address },
    };
    return requestWrapper(options);
  },

  // remove fungible commitment token shield address for user address
  unSetCoinShield({ address }) {
    const options = {
      url: `${url}/removeFTCommitmentshield`,
      method: 'DELETE',
      json: true,
      headers: { address },
    };
    return requestWrapper(options);
  },
};
