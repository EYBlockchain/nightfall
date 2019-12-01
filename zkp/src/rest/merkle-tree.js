import request from 'request';
import config from 'config';
import utilsPoll from './utils-poll';

const url = `${config.merkleTree.host}:${config.merkleTree.port}`;

/**
Start the event filter in the merkle-tree microservice, for the given contract
*/
async function start(contractName) {
  console.log(`\nCalling /start(${contractName})`);
  return new Promise((resolve, reject) => {
    const options = {
      url: `${url}/start`,
      method: 'POST',
      json: true,
      headers: { contractname: contractName },
      // body:, // no body
    };
    request(options, (err, res, body) => {
      if (err) reject(err);
      else resolve(body.data);
    });
  });
}

/**
Posts a starts merkle-tree microservice's filter
@returns {false | object} Polling functions MUST return FALSE if the poll is unsuccessful. Otherwise we return the response from the merkle-tree microservice
*/
const startEventFilterPollingFunction = async args => {
  try {
    const { contractName } = args;

    const response = await start(contractName);

    return response;
  } catch (err) {
    console.log(
      `Got a polling error "${err}", but that might be because the external server missed our call - we'll poll again...`,
    );
    return false;
  }
};

/**
Posts a starts merkle-tree microservice's filter
@param {string} contractName
*/
async function startEventFilter(contractName) {
  console.log(`\nCalling startEventFilter(${contractName})`);
  console.log('\nRequesting the merkle-tree microservice start its filter...');
  try {
    // we poll the merkle-tree microservice, because it might not be 'up' yet
    const response = await utilsPoll.poll(
      startEventFilterPollingFunction,
      config.POLLING_FREQUENCY,
      {
        contractName,
      },
    );
    return response;
  } catch (err) {
    throw new Error(`Could not start merkle-tree microservice's filter`);
  }
}

/**
Get the leaf object for the given leafIndex.
@param {string} contractName
@param {integer} leafIndex
*/
async function getLeafByLeafIndex(contractName, leafIndex) {
  console.log(`\nCalling getLeafByLeafIndex(${contractName}, ${leafIndex})`);
  return new Promise((resolve, reject) => {
    const options = {
      url: `${url}/leaf/index/${leafIndex}`,
      method: 'GET',
      json: true,
      headers: { contractname: contractName },
      // body:, // no body; uses url param
    };
    request(options, (err, res, body) => {
      if (err) reject(err);
      else resolve(body.data);
    });
  });
}

/**
Get the nodes on the sibling path from the given leafIndex to the root.
@param {string} contractName
@param {integer} leafIndex
*/
async function getSiblingPathByLeafIndex(contractName, leafIndex) {
  console.log(`\nCalling getSiblingPathByLeafIndex(${contractName}, ${leafIndex})`);
  return new Promise((resolve, reject) => {
    const options = {
      url: `${url}/siblingPath/${leafIndex}`,
      method: 'GET',
      json: true,
      headers: { contractname: contractName },
      // body:, // no body; uses url param
    };
    request(options, (err, res, body) => {
      if (err) reject(err);
      else resolve(body.data);
    });
  });
}

export default {
  startEventFilter,
  getLeafByLeafIndex,
  getSiblingPathByLeafIndex,
};
