/* eslint-disable camelcase */

import { Router } from 'express';
import utils from '../zkpUtils';
import fTokenController from '../f-token-controller';
import { getVkId, getTruffleContractInstance } from '../contractUtils';

const router = Router();

async function mint(req, res, next) {
  const { address } = req.headers;
  const { value, owner } = req.body;
  const salt = await utils.rndHex(32);
  const vkId = await getVkId('MintFToken');
  const {
    contractJson: fTokenShieldJson,
    contractInstance: fTokenShield,
  } = await getTruffleContractInstance('FTokenShield');

  try {
    const { commitment, commitmentIndex } = await fTokenController.mint(
      value,
      owner.publicKey,
      salt,
      vkId,
      {
        fTokenShieldJson,
        fTokenShieldAddress: fTokenShield.address,
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

async function transfer(req, res, next) {
  const { address } = req.headers;
  const { inputCommitments, outputCommitments, receiver, sender } = req.body;
  const vkId = await getVkId('TransferFToken');
  const {
    contractJson: fTokenShieldJson,
    contractInstance: fTokenShield,
  } = await getTruffleContractInstance('FTokenShield');

  outputCommitments[0].salt = await utils.rndHex(32);
  outputCommitments[1].salt = await utils.rndHex(32);

  try {
    const { txReceipt } = await fTokenController.transfer(
      inputCommitments,
      outputCommitments,
      receiver.publicKey,
      sender.secretKey,
      vkId,
      {
        fTokenShieldJson,
        fTokenShieldAddress: fTokenShield.address,
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

async function burn(req, res, next) {
  const { value, salt, commitment, commitmentIndex, receiver, sender } = req.body;
  const { address } = req.headers;
  const vkId = await getVkId('BurnFToken');
  const {
    contractJson: fTokenShieldJson,
    contractInstance: fTokenShield,
  } = await getTruffleContractInstance('FTokenShield');

  try {
    await fTokenController.burn(
      value,
      sender.secretKey,
      salt,
      commitment,
      commitmentIndex,
      vkId,
      {
        fTokenShieldJson,
        fTokenShieldAddress: fTokenShield.address,
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

async function checkCorrectness(req, res, next) {
  console.log('\nzkp/src/routes/ft-commitment', '\n/checkCorrectness', '\nreq.body', req.body);

  try {
    const { address } = req.headers;
    const { value, salt, pk, commitment, commitmentIndex, blockNumber } = req.body;

    const results = await fTokenController.checkCorrectness(
      value,
      pk,
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

async function setFTCommitmentShieldAddress(req, res, next) {
  const { address } = req.headers;
  const { coinShield } = req.body;

  try {
    await fTokenController.setShield(coinShield, address);
    await fTokenController.getBalance(address);
    res.data = {
      message: 'FTokenShield Address Set.',
    };
    next();
  } catch (err) {
    next(err);
  }
}

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

async function simpleFTCommitmentBatchTransfer(req, res, next) {
  const { address } = req.headers;
  const { inputCommitment, outputCommitments, sender } = req.body;
  const {
    contractJson: fTokenShieldJson,
    contractInstance: fTokenShield,
  } = await getTruffleContractInstance('FTokenShield');
  const receiversPublicKeys = [];

  if (!outputCommitments || outputCommitments.length !== 20) throw new Error('Invalid data input');

  for (const data of outputCommitments) {
    /* eslint-disable no-await-in-loop */
    data.salt = await utils.rndHex(32);
    receiversPublicKeys.push(data.receiver.publicKey);
  }

  try {
    const { z_E, z_E_index, txReceipt } = await fTokenController.simpleFungibleBatchTransfer(
      inputCommitment,
      outputCommitments,
      receiversPublicKeys,
      sender.secretKey,
      await getVkId('SimpleBatchTransferFToken'),
      {
        account: address,
        fTokenShieldJson,
        fTokenShieldAddress: fTokenShield.address,
      },
      {
        codePath: `${process.cwd()}/code/gm17/ft-batch-transfer/out`,
        outputDirectory: `${process.cwd()}/code/gm17/ft-batch-transfer`,
        pkPath: `${process.cwd()}/code/gm17/ft-batch-transfer/proving.key`,
      },
    );

    let lastCommitmentIndex = parseInt(z_E_index, 10);

    z_E.forEach((transferCommitment, indx) => {
      outputCommitments[indx].commitment = transferCommitment;
      outputCommitments[indx].commitmentIndex = lastCommitmentIndex - (z_E.length - 1);
      lastCommitmentIndex += 1;
    });

    res.data = {
      outputCommitments,
      txReceipt,
    };
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

export default router;
