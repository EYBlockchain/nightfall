import { Router } from 'express';
import { erc20, elgamal } from '@eyblockchain/nightlite';
import { randomHex } from 'zkp-utils';

import fTokenController from '../f-token-controller';
import { getWeb3ContractInstance, getContractAddress } from '../contractUtils';

const router = Router();

/**
 * @api {post} /mintFTCommitment
 * @apiDescription This function is to mint a fungible token commitment
 * @apiVersion 1.0.0
 * @apiName mintFTCommitment
 *
 * @apiParam (Request body) {Number} value ft commitment to be minted
 * @apiParam (Request body) {Object} owner Name and publicKey object of the owner

 * @apiExample {json} Example usage:
 * req.body = {
 *  value: 20,
 *  owner: {
 *    name: 'alice',
 *    publicKey: '0x70dd53411043c9ff4711ba6b6c779cec028bd43e6f525a25af36b8'
 *  }
 * }
 *
 * @apiSuccess (Success 200) {String} commitment      commitment number.
 * @apiSuccess (Success 200) {Number} commitmentIndex commitment index value from blockchain.
 * @apiSuccess (Success 200) {String} salt genearted  salt to mint commitment.
 * @apiSuccessExample {json} Success-Response:
 *  HTTP/1.1 200 OK
 *  {
 *    "commitment":"0x70bae19c32ea6e30bf9953c954df271474f86fc9a21589c3422fea314f43f6aa",
 *    "commitmentIndex":0,
 *    "salt":"0xc3b5b05920e17e3afe63efa2d18b3c5b1e2036659f891e69c513adf61a5d42f3"
 *  }
 *
 * @param {*} req
 * @param {*} res
 */
async function mint(req, res, next) {
  const { address } = req.headers;
  const { value, owner } = req.body;
  const salt = await randomHex(32);
  const fTokenShieldAddress = await getContractAddress('FTokenShield');
  const erc20Address = await getContractAddress('FToken');

  try {
    const { commitment, commitmentIndex } = await erc20.mint(
      value.toString(16),
      owner.publicKey,
      salt,
      {
        erc20Address,
        fTokenShieldAddress,
        account: address,
      },
      {
        codePath: `${process.cwd()}/code/gm17/ft-mint/out`,
        outputDirectory: `${process.cwd()}/code/gm17/ft-mint`,
        pkPath: `${process.cwd()}/code/gm17/ft-mint/proving.key`,
      },
    );
    res.data = {
      commitment,
      commitmentIndex,
      salt,
    };
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * @api {post} /transferFTCommitment
 * @apiDescription  This function is to tramsfer a fungible token commitment to a receiver
 * @apiVersion 1.0.0
 * @apiName transferFTCommitment
 *
 * @apiParam (Request body) {Object} inputCommitments   array of selected commitments.
 * @apiParam (Request body) {Object} outputCommitments  array of Hex String of value.
 * @apiParam (Request body) {Object} receiver           object with key name of receiver.
 * @apiExample {json} Example usage:
 * req.body = {
 *  inputCommitments: [{
 *      value: '0x00000000000000000000000000002710',
 *      salt: '0x14de022c9b4a437b346f04646bd7809deb81c38288e9614478351d',
 *      commitment: '0x39aaa6fe40c2106f49f72c67bc24d377e180baf3fe211c5c90e254',
 *      commitmentIndex: 0,
 *      owner,
 *  }],
 *  outputCommitments: [],
 *  receiver: {
 *    name: 'bob',
 *    publicKey: '0x70dd53411043c9ff4711ba6b6c779cec028bd43e6f525a25af36b8'
 *  }
 *  sender: {
 *    name: 'alice',
 *    secretKey: '0x30dd53411043c9ff4711ba6b6c779cec028bd43e6f525a25af3603'
 *  }
 * }
 *
 * @apiSuccess (Success 200) {Number} value value to be transferred.
 * @apiSuccess (Success 200) {String} salt genearted salt to mint commitment.
 * @apiSuccess (Success 200) {Object} owner Owner object with name and publickey.
 * @apiSuccess (Success 200) {Number} commitmentIndex commitment index value from blockchain.
 * @apiSuccess (Success 200) {String} commitment commitment number.
 * @apiSuccessExample {json} Success-Response:
 *  HTTP/1.1 200 OK
 *  {
 *     "value": "0x00000000000000000000000000000014",
 *     "salt": "0x5e785f9470d92cde5c2c4c0aacf235f58087da8c9264530ea2074e8125dfcfe1",
 *     "commitment": "0x7a6bca440eb1022f0f9e387bea0a648092b94cbaf130c915402ed8ad3c191595",
 *     "commitmentIndex": 2,
 *     "owner":
 *     {
 *         "name": "bob",
 *         "publicKey": "0xf7a4e1ae3290ffa5030c455cfae7f7d49c23c7969a72b5d2013f23ecab22b0e1"
 *    }
 *  }
 *
 * @param {*} req
 * @param {*} res
 */
async function transfer(req, res, next) {
  const { address } = req.headers;
  const { inputCommitments, outputCommitments, receiver, sender } = req.body;
  const fTokenShieldAddress = await getContractAddress('FTokenShield');
  const erc20Address = await getContractAddress('FToken');

  outputCommitments[0].salt = await randomHex(32);
  outputCommitments[1].salt = await randomHex(32);

  try {
    const { txReceipt } = await erc20.transfer(
      inputCommitments,
      outputCommitments,
      receiver.publicKey,
      sender.secretKey,
      {
        erc20Address,
        fTokenShieldAddress,
        account: address,
      },
      {
        codePath: `${process.cwd()}/code/gm17/ft-transfer/out`,
        outputDirectory: `${process.cwd()}/code/gm17/ft-transfer`,
        pkPath: `${process.cwd()}/code/gm17/ft-transfer/proving.key`,
      },
    );
    res.data = { outputCommitments, txReceipt };
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * @api {post} /burnFTCommitment
 * @apiDescription This function is to burn a fungible token commitment
 * @apiVersion 1.0.0
 * @apiName burnFTCommitment
 *
 * @apiParam (Request body) {String} value Hex String representing the 'amount' of a fungible currency to transact.
 * @apiParam (Request body) {String} publicKey Public key of Burner (Alice).
 * @apiParam (Request body) {String} senderSecretKey Secret key of Burner (Alice).
 * @apiParam (Request body) {String} salt Salt of coin A.
 * @apiParam (Request body) {String} commitmentIndex coin index value of coin A.
 * @apiParam (Request body) {String} commitment Coin Commitment of coin A.
 * @apiParam (Request body) {Object} receiver reciever name.
 * @apiExample {json} Example usage:
 * req.body = {
 *  value: 20,
 *  salt: '0x14de022c9b4a437b346f04646bd7809deb81c38288e9614478351d',
 *  commitment: '0x39aaa6fe40c2106f49f72c67bc24d377e180baf3fe211c5c90e254',
 *  commitmentIndex: 0,
 *  receiver: {
 *    name: 'bob',
 *    address: '0x70dd53411043c9ff4711ba6b6c779cec028bd43e6f525a25af36b8'
 *  }
 *  sender: {
 *    name: 'alice',
 *    secretKey: '0x30dd53411043c9ff4711ba6b6c779cec028bd43e6f525a25af3603'
 *  }
 * }
 *
 * @apiSuccess (Success 200) {String} message  Burn success message.
 * @apiSuccessExample {json} Success-Response:
 *  HTTP/1.1 200 OK
 * {
 *    "message":"Burn successful",
 * }
 *
 * @param {*} req
 * @param {*} res
 */
async function burn(req, res, next) {
  const { value, salt, commitment, commitmentIndex, receiver, sender } = req.body;
  const { address } = req.headers;
  const fTokenShieldAddress = await getContractAddress('FTokenShield');
  const erc20Address = await getContractAddress('FToken');

  try {
    await erc20.burn(
      value,
      sender.secretKey,
      salt,
      commitment,
      commitmentIndex,
      {
        erc20Address,
        fTokenShieldAddress,
        account: address,
        tokenReceiver: receiver.address,
      },
      {
        codePath: `${process.cwd()}/code/gm17/ft-burn/out`,
        outputDirectory: `${process.cwd()}/code/gm17/ft-burn`,
        pkPath: `${process.cwd()}/code/gm17/ft-burn/proving.key`,
      },
    );
    res.data = { message: 'Burn successful' };
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * @api {post} /checkCorrectnessForFTCommitment
 * @apiDescription This function is to check correctness for a fungible token commitment
 * @apiVersion 1.0.0
 * @apiName checkCorrectnessForFTCommitment
 *
 * @apiParam (Request body) {String} value Hex String representing the 'amount' of a fungible currency to transact.
 * @apiParam (Request body) {String} publicKey Public key of Burner (Alice).
 * @apiParam (Request body) {String} salt Salt of coin
 * @apiParam (Request body) {String} commitmentIndex coin index value of coin A.
 * @apiParam (Request body) {String} commitment Coin Commitment of coin A.
 * @apiExample {json} Example usage:
 * req.body:{
 *    "value":"0x0000000000000000000000000000000f",
 *    "salt":"0xd9bd557d3cba0980416a2d6010fee1c5e36b18fe68e3ec77423f7f5c5fe746ef",
 *    "publicKey":"0xae22455cb4090418171c20246ac53400e5ea9ecd573c5f58995487fe0b6c1a7e",
 *    "commitment":"0x9652aa4eb5d06a220245f391fe615a3c1d4a35e314e2d3ae817deee5c65161b3",
 *    "commitmentIndex":2,
 *    "blockNumber":51
 * }
 *
 * @apiSuccess (Success 200) {Boolean} zCorrect         zCorrect is true or false.
 * @apiSuccess (Success 200) {Boolean} zOnchainCorrect  zOnchainCorrect is true or false.
 * @apiSuccessExample {json} Success-Response:
 *  HTTP/1.1 200 OK
 * res.data: {
 *    "zCorrect":true,
 *    "zOnchainCorrect":true
 * }
 *
 * @param {*} req
 * @param {*} res
 */
async function checkCorrectness(req, res, next) {
  try {
    const { value, salt, publicKey, commitment, commitmentIndex, blockNumber } = req.body;
    const erc20Address = await getContractAddress('FToken');

    const results = await fTokenController.checkCorrectness(
      erc20Address,
      value,
      publicKey,
      salt,
      commitment,
      commitmentIndex,
      blockNumber,
    );
    res.data = results;
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * This function is to set fungible token commitment shield address
 * res.data: {
 *     message: 'FTokenShield Address Set.',
 * }
 * @param {*} req
 * @param {*} res
 */
async function setFTCommitmentShieldAddress(req, res, next) {
  const { address } = req.headers;
  const { ftCommitmentShield } = req.body;

  try {
    await fTokenController.setShield(ftCommitmentShield, address);
    await fTokenController.getBalance(address);
    res.data = {
      message: 'FTokenShield Address Set.',
    };
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * This function is to get fungible token commitment shield address
 * res.data: {
 *   shieldAddress : '0x5fA02b865d83566b6E1D95728cf2A520B6Ec6683',
 *   name : 'EYT',
 * }
 * @param {*} req
 * @param {*} res
 */
async function getFTCommitmentShieldAddress(req, res, next) {
  const { address } = req.headers;

  try {
    const shieldAddress = await fTokenController.getShieldAddress(address);
    const { name } = await fTokenController.getTokenInfo(address);
    res.data = {
      shieldAddress,
      name,
    };
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * This function is to unset fungible token commitment shield address
 * res.data: {
 *     message: 'CoinShield Address Unset.',
 * }
 * @param {*} req
 * @param {*} res
 */
async function unsetFTCommitmentShieldAddress(req, res, next) {
  const { address } = req.headers;

  try {
    fTokenController.unSetShield(address);
    res.data = {
      message: 'CoinShield Address Unset.',
    };
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * @api {post} /simpleFTCommitmentBatchTransfer
 * @apiDescription This function will do batch fungible commitment transfer
 * @apiVersion 1.0.0
 * @apiName simpleFTCommitmentBatchTransfer
 *
 * @apiParam (Request body) {Number} value              ft commitment to be minted
 * @apiParam (Request body) {Object} owner              Name and publicKey object of the owner
 * @apiParam (Request body) {Object} inputCommitments   array of selected commitments.
 * @apiParam (Request body) {Object} outputCommitments  array of Hex String of value.
 * @apiParam (Request body) {Object} sender             object with key name of sender.
 * @apiParam (Request body) {Object} receiver             object with key name of receiver.

 * @apiExample {json} Example usage:
 * req.body {
 *    inputCommitments: [{
 *      value: "0x00000000000000000000000000000028",
 *      salt: "0x75f9ceee5b886382c4fe81958da985cd812303b875210b9ca2d75378bb9bd801",
 *      commitment: "0x00000000008ec724591fde260927e3fcf85f039de689f4198ee841fcb63b16ed",
 *      commitmentIndex: 1,
 *    }],
 *    outputCommitments: [
 *      {
 *        "value": "0x00000000000000000000000000000002",
 *        "receiver": {
 *          name: "b",
 *        }
 *      },
 *      {
 *        "value": "0x00000000000000000000000000000002",
 *        "receiver": {
 *          name: "a",
 *        }
 *      }
 *    ],
 *  sender: {
 *    name: 'alice',
 *    secretKey: '0x30dd53411043c9ff4711ba6b6c779cec028bd43e6f525a25af3603'
 *  }
  }
 *
 * @apiSuccess (Success 200) {Number} value value to be transferred.
 * @apiSuccess (Success 200) {String} salt genearted salt to mint commitment.
 * @apiSuccess (Success 200) {Object} owner Owner object with name and publickey.
 * @apiSuccess (Success 200) {Number} commitmentIndex commitment index value from blockchain.
 * @apiSuccess (Success 200) {String} commitment commitment number.
 * @apiSuccessExample {json} Success-Response:
 *  HTTP/1.1 200 OK
 *      {
 *      "value":"0x00000000000000000000000000000002",
 *      "receiver":{
 *          "name":"bob",
 *          "publicKey":"0xf7a4e1ae3290ffa5030c455cfae7f7d49c23c7969a72b5d2013f23ecab22b0e1"
 *       },
 *       "salt":"0xd525f4a31e3fd9cb1d924c70162272699e4482b3d519ab1597999cf1796e230a",
 *       "commitment":"0xdadbc2a90b75b2782c7f3507e4cddd2875460d64f540db0eed536bac413bcfcc",
 *       "commitmentIndex":27,
 *        "owner":{
 *            "name":"charlie",
 *            "publicKey":"0xf7a4e1ae3290ffa5030c455cfae7f7d49c23c7969a72b5d2013f23ecab22b0e1"}
 *       }
 *
 * @param {*} req
 * @param {*} res
 */
async function simpleFTCommitmentBatchTransfer(req, res, next) {
  const { address } = req.headers;
  const { inputCommitment, outputCommitments, sender } = req.body;

  const fTokenShieldAddress = await getContractAddress('FTokenShield');
  const erc20Address = await getContractAddress('FToken');

  if (!outputCommitments || outputCommitments.length !== 20) throw new Error('Invalid data input');

  for (const data of outputCommitments) {
    /* eslint-disable no-await-in-loop */
    data.salt = await randomHex(32);
  }

  try {
    const { txReceipt } = await erc20.simpleFungibleBatchTransfer(
      inputCommitment,
      outputCommitments,
      sender.secretKey,
      {
        erc20Address,
        fTokenShieldAddress,
        account: address,
      },
      {
        codePath: `${process.cwd()}/code/gm17/ft-batch-transfer/out`,
        outputDirectory: `${process.cwd()}/code/gm17/ft-batch-transfer`,
        pkPath: `${process.cwd()}/code/gm17/ft-batch-transfer/proving.key`,
      },
    );

    res.data = {
      outputCommitments,
      txReceipt,
    };
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * This function will blacklist an account address.
 * req.body {
 *    malfeasantAddress: "0x137246e44b7b9e2f1e3ca8530e16d515bb1db586"
 * }
 * @param {*} req
 * @param {*} res
 */
async function setAddressToBlacklist(req, res, next) {
  const { address } = req.headers;
  const { malfeasantAddress } = req.body;
  try {
    const fTokenShieldAddress = await getContractAddress('FTokenShield');
    await erc20.blacklist(malfeasantAddress, {
      account: address,
      fTokenShieldAddress,
    });
    res.data = { message: 'added to blacklist' };
    next();
  } catch (err) {
    next(err);
  }
}

/** This function is to tramsfer a fungible token commitment to a receiver
 * req.body = {
 *  inputCommitments: [{
 *      value: '0x00000000000000000000000000000001',
 *      salt: '0x14de022c9b4a437b346f04646bd7809deb81c38288e9614478351d',
 *      commitment: '0x39aaa6fe40c2106f49f72c67bc24d377e180baf3fe211c5c90e254',
 *      commitmentIndex: 0,
 *      owner,
 *  },
 * {
 *      value: '0x00000000000000000000000000000002',
 *      salt: '0x14de022c9b4a437b346f04646bd7809deb81c38288e96144784219',
 *      commitment: '0x39aaa6fe40c2106f49f72c67bc24d377e180baf3fe211c5c90e975',
 *      commitmentIndex: 1,
 *      owner,
 *  },
 * {
 *      value: '0x00000000000000000000000000000003',
 *      salt: '0x14de022c9b4a437b346f04646bd7809deb81c38288e96144784208d',
 *      commitment: '0x39aaa6fe40c2106f49f72c67bc24d377e180baf3fe211c5c90e91a',
 *      commitmentIndex: 2,
 *      owner,
 *  },
 * {...},
 * ],
 *  outputCommitment: {
 *    value: "0x00000000000000000000000000000014"
 *  },
 *  receiver: {
 *    name: 'bob',
 *    publicKey: '0x70dd53411043c9ff4711ba6b6c779cec028bd43e6f525a25af36b8'
 *  }
 *  sender: {
 *    name: 'alice',
 *    secretKey: '0x30dd53411043c9ff4711ba6b6c779cec028bd43e6f525a25af3603'
 *  }
 * }
 *
 * res.data: {
 * outputCommitment:  {
 *    "value":"0x00000000000000000000000000000014",
 *    "salt":"0xce4f2a50b07c92b0c12fbf738cd8090ca898c5956f2de14f04c7f6ee6a46bdc7",
 *    "commitment":"0xbb51e94ff3a0ef1e6198195b3b412fe0def4d234ff5916ca953d521f84eea613",
 *    "commitmentIndex": 32
 *    "owner":
 *    {
 *        "name": "b",
 *        "publicKey": "0xb30f3e92f24d08a94cee52a0b4703fbdff096856376b66741a30da5538c80271"
 *     }
 *  }
 *  inputCommitments: [{
 *      value: '0x00000000000000000000000000000001',
 *      salt: '0x14de022c9b4a437b346f04646bd7809deb81c38288e9614478351d',
 *      commitment: '0x39aaa6fe40c2106f49f72c67bc24d377e180baf3fe211c5c90e254',
 *      commitmentIndex: 0,
 *      owner,
 *  },
 * {
 *      value: '0x00000000000000000000000000000002',
 *      salt: '0x14de022c9b4a437b346f04646bd7809deb81c38288e96144784219',
 *      commitment: '0x39aaa6fe40c2106f49f72c67bc24d377e180baf3fe211c5c90e975',
 *      commitmentIndex: 1,
 *      owner,
 *  },
 * {
 *      value: '0x00000000000000000000000000000003',
 *      salt: '0x14de022c9b4a437b346f04646bd7809deb81c38288e96144784208d',
 *      commitment: '0x39aaa6fe40c2106f49f72c67bc24d377e180baf3fe211c5c90e91a',
 *      commitmentIndex: 2,
 *      owner,
 *  },
 * {...},
 * ],
 * txReceipt: {}5
 * @param {*} req
 * @param {*} res
 */
async function consolidationTransfer(req, res, next) {
  const { address } = req.headers;
  const { inputCommitments, outputCommitment, receiver, sender } = req.body;

  const fTokenShieldAddress = await getContractAddress('FTokenShield');
  const erc20Address = await getContractAddress('FToken');

  if (!inputCommitments) throw new Error('Invalid data input');

  outputCommitment.salt = await randomHex(32);

  try {
    const { txReceipt } = await erc20.consolidationTransfer(
      inputCommitments,
      outputCommitment,
      receiver.publicKey,
      sender.secretKey,
      {
        erc20Address,
        fTokenShieldAddress,
        account: address,
      },
      {
        codePath: `${process.cwd()}/code/gm17/ft-consolidation-transfer/out`,
        outputDirectory: `${process.cwd()}/code/gm17/ft-consolidation-transfer`,
        pkPath: `${process.cwd()}/code/gm17/ft-consolidation-transfer/proving.key`,
      },
    );

    res.data = {
      inputCommitments,
      outputCommitment,
      txReceipt,
    };
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * This function will remove an account address from blacklist.
 * req.body {
 *    blacklistedAddress: "0x137246e44b7b9e2f1e3ca8530e16d515bb1db586"
 * }
 * @param {*} req
 * @param {*} res
 */
async function unsetAddressFromBlacklist(req, res, next) {
  const { address } = req.headers;
  const { blacklistedAddress } = req.body;
  try {
    const fTokenShieldAddress = await getContractAddress('FTokenShield');
    await erc20.unblacklist(blacklistedAddress, {
      account: address,
      fTokenShieldAddress,
    });
    res.data = { message: 'removed from blacklist' };
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * This function return transaction object from transaction hash.
 * req.body {
 *    txHash: "0xb7b47b1ac480694ccf196b31ebffb114e9cb4630fa9f132baf037fc475c3bc1d",
 *  ` type: TransferRC`
 * }
 * @param {*} req
 * @param {*} res
 */
async function decodeTransaction(req, res, next) {
  const { txHash, type, publicKeys } = req.body;
  let guessers = [];

  if (type === 'TransferRC') {
    guessers = [elgamal.rangeGenerator(1000000000), publicKeys, publicKeys];
  } else {
    // case burn
    guessers = [publicKeys];
  }

  try {
    const fTokenShieldInstance = await getWeb3ContractInstance('FTokenShield');
    const fTokenShieldEvents = await fTokenShieldInstance.getPastEvents('allEvents', {
      filter: { transactionHash: txHash },
    });

    const txReceipt = await fTokenController.getTxRecipt(txHash);

    if (!txReceipt) throw Error('No Transaction receipt found.');

    for (const log of txReceipt.logs) {
      log.event = '';
      log.args = [];

      const event = fTokenShieldEvents[log.topics[0]];
      if (event) {
        log.event = event.name;
        log.args = await fTokenController.getTxLogDecoded(event.inputs, log.data);
      }
    }

    res.data = await erc20.decryptTransaction(txReceipt, {
      type,
      guessers,
    });
    next();
  } catch (err) {
    next(err);
  }
}

router.post('/mintFTCommitment', mint);
router.post('/transferFTCommitment', transfer);
router.post('/burnFTCommitment', burn);
router.post('/checkCorrectnessForFTCommitment', checkCorrectness);
router.post('/setFTokenShieldContractAddress', setFTCommitmentShieldAddress);
router.get('/getFTokenShieldContractAddress', getFTCommitmentShieldAddress);
router.delete('/removeFTCommitmentshield', unsetFTCommitmentShieldAddress);
router.post('/simpleFTCommitmentBatchTransfer', simpleFTCommitmentBatchTransfer);
router.post('/consolidationTransfer', consolidationTransfer);
router.post('/setAddressToBlacklist', setAddressToBlacklist);
router.post('/unsetAddressFromBlacklist', unsetAddressFromBlacklist);
router.post('/decodeTransaction', decodeTransaction);

export default router;
