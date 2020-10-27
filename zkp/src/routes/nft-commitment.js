import { Router } from 'express';
import { erc721 } from '@eyblockchain/nightlite';
import { randomHex } from 'zkp-utils';

import nfController from '../nf-token-controller';
import { getContractAddress } from '../contractUtils';

const router = Router();

/**
 * @api {post} /mintNFTCommitment
 * @apiDescription This function is to mint a non fungible token
 * @apiVersion 1.0.0
 * @apiName mintNFTCommitment
 *
 * @apiParam (Request body) {String} tokenId      unique ERC-721 token Id.
 * @apiParam (Request body) {String} tokenUri     URI of token.
 * @apiExample {json} Example usage:
 * req.body = {
 *    tokenUri: 'unique token name',
 *    tokenId: '0x1448d8ab4e0d610000000000000000000000000000000000000000000000000',
 *    owner: {
 *        name: 'alice',
 *        publicKey: '0x4c45963a12f0dfa530285fde66ac235c8f8ddf8d178098cdb292ac',
 *    }
 * }
 *
 * @apiSuccess (Success 200) {String} commitment      Token commitment number.
 * @apiSuccess (Success 200) {Number} commitmentIndex token index value from blockchain.
 *
 * @apiSuccessExample {json} Success response:
 *     HTTPS 200 OK
 *	  {
 *		"commitment":"0x5b531cd1a758cf33affd093fcdb3864bfa72f7717f593a8d7d0118",
 *		"commitmentIndex":"0"
 *	  }
 *
 * @param {*} req
 * @param {*} res
 */
async function mint(req, res, next) {
  const { address } = req.headers;
  const {
    tokenId,
    owner: { publicKey },
  } = req.body;
  const salt = await randomHex(32);
  const nfTokenShieldAddress = await getContractAddress('NFTokenShield');
  const nfTokenAddress = await getContractAddress('NFTokenMetadata');

  try {
    const { commitment, commitmentIndex } = await erc721.mint(
      tokenId,
      publicKey,
      salt,
      {
        erc721Address: nfTokenAddress,
        nfTokenShieldAddress,
        account: address,
      },
      {
        codePath: `${process.cwd()}/code/gm17/nft-mint/out`,
        outputDirectory: `${process.cwd()}/code/gm17/nft-mint`,
        pkPath: `${process.cwd()}/code/gm17/nft-mint/proving.key`,
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
 * @api {post} /transferNFTCommitment
 * @apiDescription This function is to transfer a non fungible token to a reciever
 * @apiVersion 1.0.0
 * @apiName transferNFTCommitment
 *
 * @apiParam (Request body) {Object} inputCommitments   selected commitments.
 * @apiParam (Request body) {Object} outputCommitments  Hex String of value.
 * @apiParam (Request body) {Object} receiver           Object with Receiver name.
 * @apiExample {json} Example usage:
 * req.body = {
 *     tokenId: '0x1448d8ab4e0d610000000000000000000000000000000000000000000000000',
 *     tokenUri: 'unique token name',
 *     salt: '0xe9a313c89c449af6e630c25ab3acc0fc3bab821638e0d55599b518',
 *     commitment: '0xca2c0c099289896be4d72c74f801bed6e4b2cd5297bfcf29325484',
 *     commitmentIndex: 0,
 *     receiver: {
 *       name: 'alice',
 *       publicKey: '0x4c45963a12f0dfa530285fde66ac235c8f8ddf8d178098cdb292ac',
 *     }
 *     sender: {
 *       name: 'bob',
 *       secretKey: '0x2c45963a12f0dfa530285fde66ac235c8f8ddf8d178098cdb29233',
 *  }
 * }
 *
 * @apiSuccess (Success 200) {String} commitment        Token commitment number.
 * @apiSuccess (Success 200) {Number} commitmentIndex   token index value from blockchain.
 * @apiSuccess (Success 200) {String} salt              Salt of the non fungible token.
 *
 * @apiSuccessExample {json} Success response:
 * HTTPS 200 OK
 *	  {
 *		"commitment":"0x5b531cd1a758cf33affd093fcdb3864bfa72f7717f593a8d7d0118",
 *		"commitmentIndex":"1",
 *    "salt": "0xe9a313c89c449af6e630c25ab3acc0fc3bab821638e0d55599b518",
 *    "txReceipt": "0xcf6267b9393a8187ab72bf095e9ffc34af1a5d3d069b9d26e210ac",
 *	  }
 *
 * @param {*} req
 * @param {*} res
 */
async function transfer(req, res, next) {
  const {
    tokenId,
    receiver,
    salt: originalCommitmentSalt,
    sender,
    commitment,
    commitmentIndex,
  } = req.body;
  const newCommitmentSalt = await randomHex(32);
  const { address } = req.headers;
  const nfTokenShieldAddress = await getContractAddress('NFTokenShield');
  const erc721Address = await getContractAddress('NFTokenMetadata');

  try {
    const { outputCommitment, outputCommitmentIndex, txReceipt } = await erc721.transfer(
      tokenId,
      receiver.publicKey,
      originalCommitmentSalt,
      newCommitmentSalt,
      sender.secretKey,
      commitment,
      commitmentIndex,
      {
        erc721Address,
        nfTokenShieldAddress,
        account: address,
      },
      {
        codePath: `${process.cwd()}/code/gm17/nft-transfer/out`,
        outputDirectory: `${process.cwd()}/code/gm17/nft-transfer`,
        pkPath: `${process.cwd()}/code/gm17/nft-transfer/proving.key`,
      },
    );
    res.data = {
      commitment: outputCommitment,
      commitmentIndex: outputCommitmentIndex,
      salt: newCommitmentSalt,
      txReceipt,
    };
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * @api {post} /burnNFTCommitment
 * @apiDescription This function is to burn a non fungible token
 * @apiVersion 1.0.0
 * @apiName burnNFTCommitment
 *
 * @apiParam (Request body) {String} tokenId          Hex String of a non fungible token to burn.
 * @apiParam (Request body) {String} tokenUri         URI of the non fungible token.
 * @apiParam (Request body) {String} salt             Salt of the non fungible token.
 * @apiParam (Request body) {String} senderSecretKey  Secret key of Transferror (Alice).
 * @apiParam (Request body) {String} commitment       Token commitment of the non fungible token.
 * @apiParam (Request body) {String} commitmentIndex  Token index of the non fungible token.
 * @apiParam (Request body) {String} reciever         Reciever name of the non fungible token.
 *
 * @apiExample {json} Example usage:
 * req.body = {
 *     tokenId: '0x1448d8ab4e0d610000000000000000000000000000000000000000000000000',
 *     tokenUri: 'unique token name',
 *     salt: '0xe9a313c89c449af6e630c25ab3acc0fc3bab821638e0d55599b518',
 *     commitment: '0xca2c0c099289896be4d72c74f801bed6e4b2cd5297bfcf29325484',
 *     commitmentIndex: 0,
 *     receiver: {
 *       name: 'alice',
 *       address: '0x4c45963a12f0dfa530285fde66ac235c8f8ddf8d178098cdb292ac',
 *     }
 *     sender: {
 *       name: 'bob',
 *       secretKey: '0x2c45963a12f0dfa530285fde66ac235c8f8ddf8d178098cdb29233',
 *   }
 * }
 *
 * @apiSuccess (Success 200) {String} commitment        Token commitment number.
 * @apiSuccess (Success 200) {Number} commitmentIndex   token index value from blockchain.
 *
 * @apiSuccessExample {json} Success response:
 * HTTPS 200 OK
 *	  {
 *		"commitment":"0x5b531cd1a758cf33affd093fcdb3864bfa72f7717f593a8d7d0118",
 *		"commitmentIndex":"1",
 *	  }
 *
 * @param {*} req
 * @param {*} res
 */
async function burn(req, res, next) {
  const {
    tokenId,
    salt,
    sender,
    commitment,
    commitmentIndex,
    receiver: { address: tokenReceiver },
  } = req.body;
  const { address } = req.headers;
  const nfTokenShieldAddress = await getContractAddress('NFTokenShield');
  const erc721Address = await getContractAddress('NFTokenMetadata');

  try {
    const { txReceipt } = await erc721.burn(
      tokenId,
      sender.secretKey,
      salt,
      commitment,
      commitmentIndex,
      {
        erc721Address,
        nfTokenShieldAddress,
        account: address,
        tokenReceiver,
      },
      {
        codePath: `${process.cwd()}/code/gm17/nft-burn/out`,
        outputDirectory: `${process.cwd()}/code/gm17/nft-burn`,
        pkPath: `${process.cwd()}/code/gm17/nft-burn/proving.key`,
      },
    );
    res.data = {
      commitment,
      txReceipt,
    };
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * @api {post} /checkCorrectnessForNFTCommitment
 * @apiDescription This function is to check correctness of a non fungible token
 * @apiVersion 1.0.0
 * @apiName checkCorrectnessForNFTCommitment
 *
 * @apiParam (Request body) {String} tokenId          unique ERC-721 token Id.
 * @apiParam (Request body) {String} tokenUri         URI of token.
 * @apiParam (Request body) {String} salt             genearted salt for commitment.
 * @apiParam (Request body) {Number} commitmentIndex  commitment index value from blockchain.
 * @apiParam (Request body) {String} commitment       commitment number.
 * @apiExample {json} Example usage:
 * req.body : {
 *    "tokenId":"0x1f1f064ff9929000000000000000000000000000000000000000000000000000",
 *    "publicKey":"0x595bc1c5e581d3c199c3856f24db488f9caa936ddc61f68977fe84d57900f4f3",
 *    "salt":"0x5a664629b72adec1a6c3df820c86228198f93eedc5c76447c0090a585ad0e14a",
 *    "commitment":"0x8136a1d95ff7825445506ebbc9748a5e749f333faf4943a1a8e58ca54675d0da",
 *    "commitmentIndex":1,
 *    "blockNumber":209
 * }
 *
 * @apiSuccess (Success 200) {String} zCorrect        zCorrect is true or false..
 * @apiSuccess (Success 200) {String} zOnchainCorrect zOnchainCorrect is true or false.
 *
 * @apiSuccessExample {json} Success response:
 * HTTPS 200 OK
 * res.data :
 * {
 *    "zCorrect":true,
 *    "zOnchainCorrect":true
 * }
 *
 * @param {*} req
 * @param {*} res
 */
async function checkCorrectness(req, res, next) {
  try {
    const { tokenId, publicKey, salt, commitment, commitmentIndex, blockNumber } = req.body;
    const erc721Address = await getContractAddress('NFTokenMetadata');

    const results = await nfController.checkCorrectness(
      erc721Address,
      tokenId,
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
 * This function is to set a non fungible token commitment shield address
 * res.data :
 * {
 *    message: 'NFTokenShield Address Set.'
 * }
 * @param {*} req
 * @param {*} res
 */
async function setNFTCommitmentShieldAddress(req, res, next) {
  const { address } = req.headers;
  const { nftCommitmentShield } = req.body;

  try {
    await nfController.setShield(nftCommitmentShield, address);
    await nfController.getNFTName(address);
    res.data = {
      message: 'NFTokenShield Address Set.',
    };
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * This function is to get a non fungible token commitment shield address
 * res.data :
 * {
 *    shieldAddress: 0x95569f2eb9845E436993EcCc93B003273deef780,
 *    name: sample,
 * }
 * @param {*} req
 * @param {*} res
 */
async function getNFTCommitmentShieldAddress(req, res, next) {
  const { address } = req.headers;

  try {
    const shieldAddress = await nfController.getShieldAddress(address);
    const name = await nfController.getNFTName(address);
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
 * This function is to unset a non fungible token commitment shield address
 * res.data :
 * {
 *    message: 'TokenShield Address Unset.'
 * }
 * @param {*} req
 * @param {*} res
 */
async function unsetNFTCommitmentShieldAddress(req, res, next) {
  const { address } = req.headers;

  try {
    nfController.unSetShield(address);
    res.data = {
      message: 'TokenShield Address Unset.',
    };
    next();
  } catch (err) {
    next(err);
  }
}

router.post('/mintNFTCommitment', mint);
router.post('/transferNFTCommitment', transfer);
router.post('/burnNFTCommitment', burn);
router.post('/checkCorrectnessForNFTCommitment', checkCorrectness);
router.post('/setNFTCommitmentShieldContractAddress', setNFTCommitmentShieldAddress);
router.get('/getNFTCommitmentShieldContractAddress', getNFTCommitmentShieldAddress);
router.delete('/removeNFTCommitmentshield', unsetNFTCommitmentShieldAddress);

export default router;
