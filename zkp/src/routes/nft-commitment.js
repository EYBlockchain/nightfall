/* eslint-disable camelcase */

import {Router} from 'express';
import utils from '../zkpUtils';
import nfController from '../nf-token-controller';
import {getVkId, getTruffleContractInstance} from '../contractUtils';

const router = Router();

async function mint(req, res, next) {
  const {address} = req.headers;
  const {
    tokenId,
    owner: {publicKey},
  } = req.body;
  const salt = await utils.rndHex(32);
  const vkId = await getVkId('MintNFToken');
  const {
    contractJson: nfTokenShieldJson,
    contractInstance: nfTokenShield,
  } = await getTruffleContractInstance('NFTokenShield');

  try {
    const {commitment, commitmentIndex} = await nfController.mint(
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

async function transfer(req, res, next) {
  const {
    tokenId,
    receiverPublicKey,
    salt: originalCommitmentSalt,
    sender: {secretKey: senderSecretKey},
    commitment,
    commitmentIndex,
  } = req.body;
  const newCommitmentSalt = await utils.rndHex(32);
  const {address} = req.headers;
  const vkId = await getVkId('TransferNFToken');
  const {
    contractJson: nfTokenShieldJson,
    contractInstance: nfTokenShield,
  } = await getTruffleContractInstance('NFTokenShield');

  try {
    const {outputCommitment, outputCommitmentIndex, txReceipt} = await nfController.transfer(
      tokenId,
      receiverPublicKey,
      originalCommitmentSalt,
      newCommitmentSalt,
      senderSecretKey,
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

async function burn(req, res, next) {
  const {
    tokenId,
    salt,
    sender: {secretKey},
    commitment,
    commitmentIndex,
    receiver: {address: tokenReceiver},
  } = req.body;
  const {address} = req.headers;
  const vkId = await getVkId('BurnNFToken');
  const {
    contractJson: nfTokenShieldJson,
    contractInstance: nfTokenShield,
  } = await getTruffleContractInstance('NFTokenShield');

  try {
    const {txReceipt} = await nfController.burn(
      tokenId,
      secretKey,
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
    const {address} = req.headers;
    const {tokenId, publicKey, salt, commitment, commitmentIndex, blockNumber} = req.body;

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
  const {address} = req.headers;
  const {nftCommitmentShield} = req.body;

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
  const {address} = req.headers;

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
  const {address} = req.headers;

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
