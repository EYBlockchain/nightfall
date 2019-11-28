/* eslint-disable camelcase */

import { Router } from 'express';
import utils from '../zkpUtils';
import fTokenController from '../f-token-controller';
import { getVkId, getTruffleContractInstance } from '../contractUtils';

const router = Router();

async function mint(req, res, next) {
  const { address } = req.headers;
  const { amount, ownerPublicKey } = req.body;
  const salt = await utils.rndHex(32);
  const vkId = await getVkId('MintFToken');
  const {
    contractJson: fTokenShieldJson,
    contractInstance: fTokenShield,
  } = await getTruffleContractInstance('FTokenShield');

  try {
    const { commitment, commitmentIndex } = await fTokenController.mint(
      amount,
      ownerPublicKey,
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
      ft_commitment: commitment,
      ft_commitment_index: commitmentIndex,
      S_A: salt,
    };
    next();
  } catch (err) {
    next(err);
  }
}

async function transfer(req, res, next) {
  const { address } = req.headers;
  const {
    C,
    D,
    E,
    F,
    pk_B: receiverPublicKey,
    S_C,
    S_D,
    sk_A: senderSecretKey,
    z_C,
    z_C_index,
    z_D,
    z_D_index,
  } = req.body;
  const vkId = await getVkId('TransferFToken');
  const {
    contractJson: fTokenShieldJson,
    contractInstance: fTokenShield,
  } = await getTruffleContractInstance('FTokenShield');

  const inputCommitments = [
    {
      value: C,
      salt: S_C,
      commitment: z_C,
      index: z_C_index,
    },
    {
      value: D,
      salt: S_D,
      commitment: z_D,
      index: z_D_index,
    },
  ];

  const outputCommitments = [
    {
      value: E,
      salt: await utils.rndHex(32),
    },
    {
      value: F,
      salt: await utils.rndHex(32),
    },
  ];

  try {
    const {
      outputCommitments: returnedOutputCommitments,
      transferReceipt,
    } = await fTokenController.transfer(
      inputCommitments,
      outputCommitments,
      receiverPublicKey,
      senderSecretKey,
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
    res.data = {
      z_E: returnedOutputCommitments[0].commitment,
      z_E_index: returnedOutputCommitments[0].index,
      z_F: returnedOutputCommitments[1].commitment,
      z_F_index: returnedOutputCommitments[1].index,
      S_E: returnedOutputCommitments[0].salt,
      S_F: returnedOutputCommitments[1].salt,
      txObj: transferReceipt,
    };
    next();
  } catch (err) {
    next(err);
  }
}

async function burn(req, res, next) {
  const { amount, receiverSecretKey, salt, commitment, commitmentIndex, tokenReceiver } = req.body;
  const { address } = req.headers;
  const vkId = await getVkId('BurnFToken');
  const {
    contractJson: fTokenShieldJson,
    contractInstance: fTokenShield,
  } = await getTruffleContractInstance('FTokenShield');

  try {
    await fTokenController.burn(
      amount,
      receiverSecretKey,
      salt,
      commitment,
      commitmentIndex,
      vkId,
      {
        fTokenShieldJson,
        fTokenShieldAddress: fTokenShield.address,
        account: address,
        tokenReceiver,
      },
      {
        codePath: `${process.cwd()}/code/gm17/ft-burn/out`,
        outputDirectory: `${process.cwd()}/code/gm17/ft-burn`,
        pkPath: `${process.cwd()}/code/gm17/ft-burn/proving.key`,
      },
    );
    res.data = {
      z_C: commitment,
      z_C_index: commitmentIndex,
    };
    next();
  } catch (err) {
    next(err);
  }
}

async function checkCorrectness(req, res, next) {
  console.log('\nzkp/src/restapi', '\n/checkCorrectnessForFTCommitment', '\nreq.body', req.body);

  try {
    const { address } = req.headers;
    const {
      E: value,
      pk: publicKey,
      S_E: salt,
      z_E: commitment,
      z_E_index: commitmentIndex,
    } = req.body;

    const results = await fTokenController.checkCorrectness(
      value,
      publicKey,
      salt,
      commitment,
      commitmentIndex,
      address,
    );
    console.log('\nzkp/src/restapi', '\n/coin/checkCorrectness', '\nresults', results);

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
      message: 'CoinShield Address Set.',
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
  const {
    amount,
    salt,
    commitment,
    commitmentIndex,
    transferData, // [{value: "0x00000000000000000000000000000002", pkB: "0x70dd53411043c9ff4711ba6b6c779cec028bd43e6f525a25af36b8"}]
    senderSecretKey,
  } = req.body;
  const {
    contractJson: fTokenShieldJson,
    contractInstance: fTokenShield,
  } = await getTruffleContractInstance('FTokenShield');
  const receiversPublicKeys = [];

  if (!transferData || transferData.length !== 20) throw new Error('Invalid data input');

  for (const data of transferData) {
    /* eslint-disable no-await-in-loop */
    data.salt = await utils.rndHex(32);
    receiversPublicKeys.push(data.pkB);
  }

  try {
    const { z_E, z_E_index } = await fTokenController.simpleFungibleBatchTransfer(
      { value: amount, salt, commitment, index: commitmentIndex },
      transferData,
      receiversPublicKeys,
      senderSecretKey,
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
      transferData[indx].commitment = transferCommitment;
      transferData[indx].commitmentIndex = lastCommitmentIndex - (z_E.length - 1);
      lastCommitmentIndex += 1;
    });

    res.data = transferData;
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
