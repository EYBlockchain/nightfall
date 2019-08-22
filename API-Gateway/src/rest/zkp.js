const request = require('request');

const Config = require('../config/config').getProps();

const host = `${Config.zkp.host}:${Config.zkp.port}`;

const loadVks = (details, headers) => {
  return new Promise((resolve, reject) => {
    const options = {
      url: `${host}/vk`,
      method: 'POST',
      json: true,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        address: headers.address,
        password: headers.password,
      },
      body: details,
    };
    request(options, (err, res, data) => {
      if (err) return reject(err);
      if (data.statusCode !== 200) return reject(data);
      return resolve(data);
    });
  });
};

const mintToken = ({ address }, body) => {
  return new Promise((resolve, reject) => {
    const options = {
      url: `${host}/token/mint`,
      method: 'POST',
      json: true,
      headers: { address },
      body,
    };
    request(options, (err, res, data) => {
      if (err) return reject(err);
      if (data.statusCode !== 200) return reject(data);
      return resolve(data);
    });
  });
};

const spendToken = ({ address }, body) => {
  return new Promise((resolve, reject) => {
    const options = {
      url: `${host}/token/transfer`,
      method: 'POST',
      json: true,
      headers: { address },
      body,
    };
    request(options, (err, res, data) => {
      if (err) return reject(err);
      if (data.statusCode !== 200) return reject(data);
      return resolve(data);
    });
  });
};

const burnToken = ({ address }, body) => {
  return new Promise((resolve, reject) => {
    const options = {
      url: `${host}/token/burn`,
      method: 'POST',
      json: true,
      headers: { address },
      body,
    };
    request(options, (err, res, data) => {
      if (err) return reject(err);
      if (data.statusCode !== 200) return reject(data);
      return resolve(data);
    });
  });
};

const mintCoin = ({ address }, body) => {
  return new Promise((resolve, reject) => {
    const options = {
      url: `${host}/coin/mint`,
      method: 'POST',
      json: true,
      headers: { address },
      body,
    };
    request(options, (err, res, data) => {
      if (err) return reject(err);
      if (data.statusCode !== 200) return reject(data);
      return resolve(data);
    });
  });
};

const transferCoin = ({ address }, body) => {
  return new Promise((resolve, reject) => {
    const options = {
      url: `${host}/coin/transfer`,
      method: 'POST',
      json: true,
      headers: { address },
      body,
    };
    request(options, (err, res, data) => {
      if (err) return reject(err);
      if (data.statusCode !== 200) return reject(data);
      return resolve(data);
    });
  });
};

const burnCoin = (details, { address }) => {
  return new Promise((resolve, reject) => {
    const options = {
      url: `${host}/coin/burn`,
      method: 'POST',
      json: true,
      headers: { address },
      body: details,
    };
    request(options, (err, res, data) => {
      if (err) return reject(err);
      if (data.statusCode !== 200) return reject(data);
      return resolve(data);
    });
  });
};

const mintNFToken = ({ address }, body) => {
  return new Promise((resolve, reject) => {
    const options = {
      url: `${host}/nft/mint`,
      method: 'POST',
      json: true,
      headers: { address },
      body,
    };
    request(options, (err, res, data) => {
      if (err) return reject(err);
      if (data.statusCode !== 200) return reject(data);
      return resolve(data);
    });
  });
};

const transferNFToken = ({ address }, body) => {
  return new Promise((resolve, reject) => {
    const options = {
      url: `${host}/nft/transfer`,
      method: 'POST',
      json: true,
      headers: { address },
      body,
    };
    request(options, (err, res, data) => {
      if (err) return reject(err);
      if (data.statusCode !== 200) return reject(data);
      return resolve(data);
    });
  });
};

const burnNFToken = ({ address }, body) => {
  return new Promise((resolve, reject) => {
    const options = {
      url: `${host}/nft/burn`,
      method: 'POST',
      json: true,
      headers: { address },
      body,
    };
    request(options, (err, res, data) => {
      if (err) return reject(err);
      if (data.statusCode !== 200) return reject(data);
      return resolve(data);
    });
  });
};

const transferFToken = ({ address }, body) => {
  return new Promise((resolve, reject) => {
    const options = {
      url: `${host}/ft/transfer`,
      method: 'POST',
      json: true,
      headers: { address },
      body,
    };
    request(options, (err, res, data) => {
      if (err) return reject(err);
      if (data.statusCode !== 200) return reject(data);
      return resolve(data);
    });
  });
};

const setTokenShield = ({ address }, body) => {
  return new Promise((resolve, reject) => {
    const options = {
      url: `${host}/token/shield`,
      method: 'POST',
      json: true,
      headers: { address },
      body,
    };
    request(options, (err, res, data) => {
      if (err) return reject(err);
      if (data.statusCode !== 200) return reject(data);
      return resolve(data);
    });
  });
};

const setCoinShield = ({ address }, body) => {
  return new Promise((resolve, reject) => {
    const options = {
      url: `${host}/coin/shield`,
      method: 'POST',
      json: true,
      headers: { address },
      body,
    };
    request(options, (err, res, data) => {
      if (err) return reject(err);
      if (data.statusCode !== 200) return reject(data);
      return resolve(data);
    });
  });
};

const unSetCoinShield = ({ address }) => {
  return new Promise((resolve, reject) => {
    const options = {
      url: `${host}/coin/shield`,
      method: 'DELETE',
      json: true,
      headers: { address },
    };
    request(options, (err, res, data) => {
      if (err) return reject(err);
      if (data.statusCode !== 200) return reject(data);
      return resolve(data);
    });
  });
};

const unSetTokenShield = ({ address }) => {
  return new Promise((resolve, reject) => {
    const options = {
      url: `${host}/token/shield`,
      method: 'DELETE',
      json: true,
      headers: { address },
    };
    request(options, (err, res, data) => {
      if (err) return reject(err);
      if (data.statusCode !== 200) return reject(data);
      return resolve(data);
    });
  });
};

const mintFToken = ({ address }, body) => {
  return new Promise((resolve, reject) => {
    const options = {
      url: `${host}/ft/mint`,
      method: 'POST',
      json: true,
      headers: { address },
      body,
    };
    request(options, (err, res, data) => {
      if (err) return reject(err);
      if (data.statusCode !== 200) return reject(data);
      return resolve(data);
    });
  });
};

const burnFToken = ({ address }, body) => {
  return new Promise((resolve, reject) => {
    const options = {
      url: `${host}/ft/burn`,
      method: 'POST',
      json: true,
      headers: { address },
      body,
    };
    request(options, (err, res, data) => {
      if (err) return reject(err);
      if (data.statusCode !== 200) return reject(data);
      return resolve(data);
    });
  });
};

const checkCorrectnessToken = (headers, body) => {
  return new Promise((resolve, reject) => {
    const options = {
      url: `${host}/token/checkCorrectness`,
      method: 'POST',
      json: true,
      headers,
      body,
    };
    request(options, (err, res, data) => {
      if (err) return reject(err);
      if (data.statusCode !== 200) return reject(data);
      return resolve(data);
    });
  });
};

const checkCorrectnessCoin = (headers, body) => {
  return new Promise((resolve, reject) => {
    const options = {
      url: `${host}/coin/checkCorrectness`,
      method: 'POST',
      json: true,
      headers,
      body,
    };
    request(options, (err, res, data) => {
      if (err) return reject(err);
      if (data.statusCode !== 200) return reject(data);
      return resolve(data);
    });
  });
};

const getCoinShield = ({ address }) => {
  return new Promise((resolve, reject) => {
    const options = {
      url: `${host}/coin/shield`,
      method: 'GET',
      json: true,
      headers: { address },
    };
    request(options, (err, res, data) => {
      if (err) return reject(err);
      if (data.statusCode !== 200) return reject(data);
      return resolve(data);
    });
  });
};

const getTokenShield = ({ address }) => {
  return new Promise((resolve, reject) => {
    const options = {
      url: `${host}/token/shield`,
      method: 'GET',
      json: true,
      headers: { address },
    };
    request(options, (err, res, data) => {
      if (err) return reject(err);
      if (data.statusCode !== 200) return reject(data);
      return resolve(data);
    });
  });
};

module.exports = {
  loadVks,
  mintToken,
  spendToken,
  mintCoin,
  transferCoin,
  burnToken,
  burnCoin,
  mintNFToken,
  transferNFToken,
  burnNFToken,
  transferFToken,
  setTokenShield,
  setCoinShield,
  unSetCoinShield,
  unSetTokenShield,
  mintFToken,
  burnFToken,
  checkCorrectnessToken,
  checkCorrectnessCoin,
  getCoinShield,
  getTokenShield,
};
