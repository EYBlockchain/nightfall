import { Router } from 'express';
import { erc721 } from '@eyblockchain/nightlite';
import utils from '../zkpUtils';
import nfController from '../nf-token-controller';
import { getVkId, getTruffleContractInstance } from '../contractUtils';

const router = Router();
/**
 * This function is to mint a non fungible token
 * const data = {
 *    tokenUri: 'unique token name',
 *    tokenId: '0x1448d8ab4e0d610000000000000000000000000000000000000000000000000',
 *    owner: {
 *        name: 'alice',
 *        publicKey: '0x4c45963a12f0dfa530285fde66ac235c8f8ddf8d178098cdb292ac',
 *    }
 * }
 * @param {*} req
 * @param {*} res
 */
async function mint(req, res, next) {
  const { address } = req.headers;
  const {
    tokenId,
    owner: { publicKey },
  } = req.body;
  const salt = await utils.rndHex(32);
  const vkId = await getVkId('MintNFToken');
  const {
    contractJson: nfTokenShieldJson,
    contractInstance: nfTokenShield,
  } = await getTruffleContractInstance('NFTokenShield');

  try {
    const { commitment, commitmentIndex } = await erc721.mint(
      tokenId,
      publicKey,
      salt,
      vkId,
      {
        nfTokenShieldJson,
        nfTokenShieldAddress: nfTokenShield.address,
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
 * This function is to transfer a non fungible token to a reciever
 * const data = {
      tokenId: '0x1448d8ab4e0d610000000000000000000000000000000000000000000000000',
      tokenUri: 'unique token name',
      salt: '0xe9a313c89c449af6e630c25ab3acc0fc3bab821638e0d55599b518',
      commitment: '0xca2c0c099289896be4d72c74f801bed6e4b2cd5297bfcf29325484',
      commitmentIndex: 0,
      receiver: {
        name: 'alice',
        publicKey: '0x4c45963a12f0dfa530285fde66ac235c8f8ddf8d178098cdb292ac',
      }
      sender: {
        name: 'bob',
        secretKey: '0x2c45963a12f0dfa530285fde66ac235c8f8ddf8d178098cdb29233',
     }
 * }
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
  const newCommitmentSalt = await utils.rndHex(32);
  const { address } = req.headers;
  const vkId = await getVkId('TransferNFToken');
  const {
    contractJson: nfTokenShieldJson,
    contractInstance: nfTokenShield,
  } = await getTruffleContractInstance('NFTokenShield');

  try {
    const { outputCommitment, outputCommitmentIndex, txReceipt } = await erc721.transfer(
      tokenId,
      receiver.publicKey,
      originalCommitmentSalt,
      newCommitmentSalt,
      sender.secretKey,
      commitment,
      commitmentIndex,
      vkId,
      {
        nfTokenShieldJson,
        nfTokenShieldAddress: nfTokenShield.address,
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
 * This function is to transfer a non fungible token to a reciever
 * const data = {
      tokenId: '0x1448d8ab4e0d610000000000000000000000000000000000000000000000000',
      tokenUri: 'unique token name',
      salt: '0xe9a313c89c449af6e630c25ab3acc0fc3bab821638e0d55599b518',
      commitment: '0xca2c0c099289896be4d72c74f801bed6e4b2cd5297bfcf29325484',
      commitmentIndex: 0,
      receiver: {
        name: 'alice',
        address: '0x4c45963a12f0dfa530285fde66ac235c8f8ddf8d178098cdb292ac',
      }
      sender: {
        name: 'bob',
        secretKey: '0x2c45963a12f0dfa530285fde66ac235c8f8ddf8d178098cdb29233',
     }
 * }
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
  const vkId = await getVkId('BurnNFToken');
  const {
    contractJson: nfTokenShieldJson,
    contractInstance: nfTokenShield,
  } = await getTruffleContractInstance('NFTokenShield');

  try {
    const { txReceipt } = await erc721.burn(
      tokenId,
      sender.secretKey,
      salt,
      commitment,
      commitmentIndex,
      vkId,
      {
        nfTokenShieldJson,
        nfTokenShieldAddress: nfTokenShield.address,
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

async function checkCorrectness(req, res, next) {
  console.log('\nzkp/src/routes/nft-commitment', '\n/checkCorrectness', '\nreq.body', req.body);

  try {
    const { address } = req.headers;
    const { tokenId, publicKey, salt, commitment, commitmentIndex, blockNumber } = req.body;

    const results = await nfController.checkCorrectness(
      tokenId,
      publicKey,
      salt,
      commitment,
      commitmentIndex,
      blockNumber,
      address,
    );
    res.data = results;
    next();
  } catch (err) {
    next(err);
  }
}

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
