import request from 'request';
import { getProps } from '../config/config';

const { offchain } = getProps();
const host = `${offchain.host}:${offchain.port}`;

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
 * rest calls to offchain microservice
 */
export default {
  // check, is name already used
  isNameInUse(name) {
    const options = {
      url: `${host}/pkd/name/exists`,
      method: 'POST',
      json: true,
      qs: { name },
    };
    return requestWrapper(options);
  },

  // associate name to geth account
  setName(address, name) {
    const options = {
      url: `${host}/pkd/name`,
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
      url: `${host}/pkd/zkp-publickey`,
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
      url: `${host}/pkd/address`,
      method: 'GET',
      json: true,
      qs: { name },
    };
    return requestWrapper(options);
  },

  // get associated whisper for a name
  getWhisperPK(name) {
    const options = {
      url: `${host}/pkd/whisperkey`,
      method: 'GET',
      json: true,
      qs: { name },
    };
    return requestWrapper(options);
  },

  // get associated zkp publickey for a name
  getZkpPublicKeyFromName(name) {
    const options = {
      url: `${host}/pkd/zkp-publickey`,
      method: 'GET',
      json: true,
      qs: { name },
    };
    return requestWrapper(options);
  },

  // associate whisper key to geth account
  setWhisperPK({ address }, whisperPk) {
    const options = {
      url: `${host}/pkd/whisperkey`,
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
      url: `${host}/whisper/generateShhIdentity`,
      method: 'POST',
      json: true,
      body,
    };
    return requestWrapper(options);
  },

  // get whisper identity
  getWhisperPublicKey(qs) {
    const options = {
      url: `${host}/whisper/getWhisperPublicKey`,
      method: 'GET',
      json: true,
      qs,
    };
    return requestWrapper(options);
  },

  // subcribe to a topic
  subscribe(body) {
    const options = {
      url: `${host}/whisper/subscribe`,
      method: 'POST',
      json: true,
      body,
    };
    return requestWrapper(options);
  },

  // send whisper message to recipient
  sendMessage(body) {
    const options = {
      url: `${host}/whisper/sendMessage`,
      method: 'POST',
      json: true,
      body,
    };
    return requestWrapper(options);
  },
};
