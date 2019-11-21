/* eslint-disable camelcase */

import { Router } from 'express';
import utils from '../zkpUtils';
import nfController from '../nf-token-controller';
import { getVkId, getContract } from '../contractUtils';

const router = Router();

async function mint(req, res, next) {
  const { address } = req.headers;
  const { tokenId, ownerPublicKey } = req.body;
  const salt = await utils.rndHex(32);
  const vkId = await getVkId('MintNFToken');
  const { contractJson: nfTokenShieldJson, contractInstance: nfTokenShield } = await getContract(
    'NFTokenShield',
  );

  try {
    const { commitment, commitmentIndex } = await nfController.mint(
      tokenId,
      ownerPublicKey,
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
      z_A: commitment,
      z_A_index: commitmentIndex,
      S_A: salt,
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
    originalCommitmentSalt,
    senderSecretKey,
    commitment,
    commitmentIndex,
  } = req.body;
  const newCommitmentSalt = await utils.rndHex(32);
  const { address } = req.headers;
  const vkId = await getVkId('TransferNFToken');
  const { contractJson: nfTokenShieldJson, contractInstance: nfTokenShield } = await getContract(
    'NFTokenShield',
  );

  try {
    const {
      outputCommitment,
      outputCommitmentIndex,
      transferReceipt,
    } = await nfController.transfer(
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
      z_B: outputCommitment,
      z_B_index: outputCommitmentIndex,
      txObj: transferReceipt,
      S_B: newCommitmentSalt,
    };
    next();
  } catch (err) {
    next(err);
  }
}

async function burn(req, res, next) {
  const { tokenId, salt, secretKey, commitment, commitmentIndex, tokenReceiver } = req.body;
  const { address } = req.headers;
  const vkId = await getVkId('BurnNFToken');
  const { contractJson: nfTokenShieldJson, contractInstance: nfTokenShield } = await getContract(
    'NFTokenShield',
  );

  try {
    await nfController.burn(
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
      z_A: commitment,
    };
    next();
  } catch (err) {
    next(err);
  }
}

async function checkCorrectness(req, res, next) {
  console.log('\nzkp/src/restapi', '\n/checkCorrectnessForNFTCommitment', '\nreq.body', req.body);

  try {
    const { address } = req.headers;
    const {
      A: tokenId,
      pk: ownerPublicKey,
      S_A: salt,
      z_A: commitment,
      z_A_index: commitmentIndex,
    } = req.body;

    const results = await nfController.checkCorrectness(
      tokenId,
      ownerPublicKey,
      salt,
      commitment,
      commitmentIndex,
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
  const { tokenShield } = req.body;

  try {
    await nfController.setShield(tokenShield, address);
    await nfController.getNFTName(address);
    res.data = {
      message: 'TokenShield Address Set.',
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
