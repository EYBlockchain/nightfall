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
      url: `${url}/nameExists`,
      method: 'GET',
      json: true,
      qs: { name },
    };
    return requestWrapper(options);
  },

  // associate name to geth account
  setName(address, name) {
    const options = {
      url: `${url}/setNameToAccount`,
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
      url: `${url}/setPublickeyToAddressInPKD`,
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
      url: `${url}/getAllRegisteredAddresses`,
      method: 'GET',
      json: true,
      qs: { name },
    };
    return requestWrapper(options);
  },

  // get all registered names
  getRegisteredNames() {
    const options = {
      url: `${url}/getAllRegisteredNames`,
      method: 'GET',
      json: true,
    };
    return requestWrapper(options);
  },

  // get associated whisper for a name
  getWhisperPK(name) {
    const options = {
      url: `${url}/getWhisperKeyForAccount`,
      method: 'GET',
      json: true,
      qs: { name },
    };
    return requestWrapper(options);
  },

  // get associated zkp publickey for a name
  getZkpPublicKeyFromName(name) {
    const options = {
      url: `${url}/getZkpPublicKeyForAccount`,
      method: 'GET',
      json: true,
      qs: { name },
    };
    return requestWrapper(options);
  },

  // associate whisper key to geth account
  setWhisperPK({ address }, whisperPk) {
    const options = {
      url: `${url}/setWhisperKeyToAccount`,
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
      url: `${url}/generateShhIdentity`,
      method: 'POST',
      json: true,
      body,
    };
    return requestWrapper(options);
  },

  // get whisper identity
  getWhisperPublicKey(qs) {
    const options = {
      url: `${url}/getWhisperPublicKey`,
      method: 'GET',
      json: true,
      qs,
    };
    return requestWrapper(options);
  },

  // subcribe to a topic
  subscribe(body) {
    const options = {
      url: `${url}/subscribeToTopic`,
      method: 'POST',
      json: true,
      body,
    };
    return requestWrapper(options);
  },

  // send whisper message to recipient
  sendMessage(body) {
    const options = {
      url: `${url}/sendMessage`,
      method: 'POST',
      json: true,
      body,
    };
    return requestWrapper(options);
  },
};
