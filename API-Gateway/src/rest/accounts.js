const request = require('request');

const Config = require('../config/config').getProps();

const host = `${Config.accounts.host}:${Config.accounts.port}`;

const createAccount = password => {
  return new Promise((resolve, reject) => {
    const options = {
      url: `${host}/account/new`,
      method: 'POST',
      json: true,
      body: { password },
    };
    request(options, (err, res, body) => {
      if (err) reject(err);
      resolve(body);
    });
  });
};

const unlockAccount = body => {
  return new Promise((resolve, reject) => {
    const options = {
      url: `${host}/accounts/unlock`,
      method: 'POST',
      json: true,
      body,
    };
    request(options, (err, res, data) => {
      if (err) reject(err);
      if (data.statusCode !== 200) {
        return reject(data.err);
      }
      return resolve(body);
    });
  });
};

module.exports = {
  createAccount,
  unlockAccount,
};
