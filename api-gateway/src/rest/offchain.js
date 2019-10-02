import request from 'request';
import config from 'config';

const url = config.get('offchain.url');

const requestWrapper = options =>
  new Promise(function promiseHandler(resolve, reject) {
    request(options, function responseHandler(err, res, body) {
      if (err || res.statusCode === 500) {
        return reject(err || res.body);
      }
      return resolve(body.data);
    });
  });

/*
 * rest calls to offchain microservice
 */
export default {
  // check, is name already used
  isNameInUse(name) {
    const options = {
      url: `${url}/pkd/name/exists`,
      method: 'GET',
      json: true,
      qs: { name },
    };
    return requestWrapper(options);
  },

  // associate name to geth account
  setName(address, name) {
    const options = {
      url: `${url}/pkd/name`,
      method: 'POST',
      json: true,
      headers: { address },
      body: { name },
    };
    return requestWrapper(options);
  },

  // associate zkp publickey to geth account
  setZkpPublicKey(address, body) {
    const options = {
      url: `${url}/pkd/zkp-publickey`,
      method: 'POST',
      json: true,
      headers: { address },
      body,
    };
    return requestWrapper(options);
  },

  // get associated Address for a name
  getAddressFromName(name) {
    const options = {
      url: `${url}/pkd/address`,
      method: 'GET',
      json: true,
      qs: { name },
    };
    return requestWrapper(options);
  },

  // get associated whisper for a name
  getWhisperPK(name) {
    const options = {
      url: `${url}/pkd/whisperkey`,
      method: 'GET',
      json: true,
      qs: { name },
    };
    return requestWrapper(options);
  },

  // get associated zkp publickey for a name
  getZkpPublicKeyFromName(name) {
    const options = {
      url: `${url}/pkd/zkp-publickey`,
      method: 'GET',
      json: true,
      qs: { name },
    };
    return requestWrapper(options);
  },

  // associate whisper key to geth account
  setWhisperPK({ address }, whisperPk) {
    const options = {
      url: `${url}/pkd/whisperkey`,
      method: 'POST',
      json: true,
      headers: { address },
      body: { whisper_pk: whisperPk },
    };
    return requestWrapper(options);
  },

  // generate whisper identity for user.
  generateShhIdentity(body) {
    const options = {
      url: `${url}/whisper/generateShhIdentity`,
      method: 'POST',
      json: true,
      body,
    };
    return requestWrapper(options);
  },

  // get whisper identity
  getWhisperPublicKey(qs) {
    const options = {
      url: `${url}/whisper/getWhisperPublicKey`,
      method: 'GET',
      json: true,
      qs,
    };
    return requestWrapper(options);
  },

  // subcribe to a topic
  subscribe(body) {
    const options = {
      url: `${url}/whisper/subscribe`,
      method: 'POST',
      json: true,
      body,
    };
    return requestWrapper(options);
  },

  // send whisper message to receiver
  sendMessage(body) {
    const options = {
      url: `${url}/whisper/sendMessage`,
      method: 'POST',
      json: true,
      body,
    };
    return requestWrapper(options);
  },
};
