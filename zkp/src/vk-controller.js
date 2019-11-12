/**
@module vk-controller.js
@author iAmMichaelConnor
@desc this acts as a layer of logic between the restapi.js, which lands the
rest api calls, and the heavy-lifitng token-zkp.js and zokrates.js.  It exists so that the amount of logic in restapi.js is absolutely minimised.
*/

import contract from 'truffle-contract';
import jsonfile from 'jsonfile';
import fs from 'fs';
import config from 'config';
import utils from './zkpUtils';
import Web3 from './web3';

const NFtokenShield = contract(jsonfile.readFileSync('./build/contracts/NFTokenShield.json'));
NFtokenShield.setProvider(Web3.connect());

const FtokenShield = contract(jsonfile.readFileSync('./build/contracts/FTokenShield.json'));
FtokenShield.setProvider(Web3.connect());

const VerifierRegistry = contract(
  jsonfile.readFileSync('./build/contracts/Verifier_Registry.json'),
);
VerifierRegistry.setProvider(Web3.connect());

const Verifier = contract(jsonfile.readFileSync('./build/contracts/GM17_v0.json'));
Verifier.setProvider(Web3.connect());

let vkIds = {};

const web3 = Web3.connection();

/**
Loads a verification key to the Verifier Registry
@param {filepath} vkJsonFile - the verifying key, in JSON format
@param {filepath} vkIdJsonFile - the JSON in which we store the vkId, after the vk has been loaded to the verifier contract (we are provided the vkId by the smart contract).
@param {string} vkDescription - human-readable string to describe the vk being uploaded. This will be the vk's 'key' within the vkIdJsonFile.
E.g. TokenMint, TokenTransfer, CoinMint, CoinBurn, AgreeContract,...
@param {string} account - the account from which the vk's are being uploaded (also used in creating the vkId)
*/
async function loadVk(vkJsonFile, vkDescription, account) {
  console.log('\nDEPLOYING VK FOR', vkDescription);

  // check relevant contracts are deployed:
  const verifier = await Verifier.deployed();
  const verifierRegistry = await VerifierRegistry.deployed();

  let vk = await new Promise((resolve, reject) => {
    jsonfile.readFile(vkJsonFile, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
  vk = Object.values(vk);
  // convert to flattened array:
  vk = utils.flattenDeep(vk);
  // convert to decimal, as the solidity functions expect uints
  vk = vk.map(el => utils.hexToDec(el));

  // upload the vk to the smart contract
  console.log('Registering verifying key');
  const txReceipt = await verifierRegistry.registerVk(vk, [verifier.address], {
    from: account,
    gas: 6500000,
    gasPrice: config.GASPRICE,
  });

  // eslint-disable-next-line no-underscore-dangle
  const vkId = txReceipt.logs[0].args._vkId;

  // add new vkId's to the json
  vkIds[vkDescription] = {};
  vkIds[vkDescription].vkId = vkId;
  vkIds[vkDescription].Address = account;

  const vkIdsAsJson = JSON.stringify(vkIds, null, 2);
  await new Promise((resolve, reject) => {
    fs.writeFile(config.VK_IDS, vkIdsAsJson, err => {
      if (err) {
        console.log(
          `fs.writeFile has failed when writing the new vk information to vkIds.json. Here's the error:`,
        );
        reject(err);
      }
      console.log(vkIds[vkDescription]);
      console.log(`writing to ${config.VK_IDS}`);
      resolve();
    });
  });
}

/**
Reads the vkIds json from file
*/
async function getVkIds() {
  if (fs.existsSync(config.VK_IDS)) {
    console.log('Reading vkIds from json file...');
    vkIds = await new Promise((resolve, reject) => {
      jsonfile.readFile(config.VK_IDS, (err, data) => {
        // doesn't natively support promises
        if (err) reject(err);
        else resolve(data);
      });
    });
  }
}

/**
Set the vkId's which correspond to 'mint', 'transfer', and 'burn' in the specified Shield contract
@param {string} account - Ethereum account. MUST be the owner of the shield contracts.
*/
async function setVkIds(account) {
  const nfTokenShield = await NFtokenShield.deployed();
  const fTokenShield = await FtokenShield.deployed();

  await getVkIds();

  console.log('Setting vkIds within NFTokenShield');
  await nfTokenShield.setVkIds(
    vkIds.MintToken.vkId,
    vkIds.TransferToken.vkId,
    vkIds.BurnToken.vkId,
    {
      from: account,
      gas: 6500000,
      gasPrice: config.GASPRICE,
    },
  );

  console.log('Setting vkIds within fTokenShield');
  await fTokenShield.setVkIds(vkIds.MintCoin.vkId, vkIds.TransferCoin.vkId, vkIds.BurnCoin.vkId, {
    from: account,
    gas: 6500000,
    gasPrice: config.GASPRICE,
  });
}

/**
Overarching orchestrator:
- Loads vks to the Verifier Registry
- Sets vkIds in the Shield contracs
*/
async function vkController() {
  // read existing vkIds (if they exist)
  await getVkIds();

  const accounts = await web3.eth.getAccounts();
  const account = accounts[0];

  // load each vk to the Verifier Registry
  await loadVk(config.NFT_MINT_VK, 'MintNFToken', account);
  await loadVk(config.NFT_TRANSFER_VK, 'TransferNFToken', account);
  await loadVk(config.NFT_BURN_VK, 'BurnNFToken', account);

  await loadVk(config.FT_MINT_VK, 'MintFToken', account);
  await loadVk(config.FT_TRANSFER_VK, 'TransferFToken', account);
  await loadVk(config.FT_BURN_VK, 'BurnFToken', account);

  await setVkIds(account);

  console.log('VK setup complete');
}

async function runController() {
  await vkController();
}

if (process.env.NODE_ENV !== 'test') runController();

export default {
  runController,
};
