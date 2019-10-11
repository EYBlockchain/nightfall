/* eslint-disable camelcase */

import { Router } from 'express';
import utils from 'zkp-utils';
import nfController from '../nf-token-controller';

const router = Router();

async function mint(req, res, next) {
  const { address } = req.headers;
  const { A, pk_A } = req.body;
  const S_A = await utils.rndHex(32);

  try {
    const [z_A, z_A_index] = await nfController.mint(A, pk_A, S_A, address);

    res.data = {
      z_A,
      z_A_index,
      S_A,
    };
    next();
  } catch (err) {
    next(err);
  }
}

async function transfer(req, res, next) {
  const { A, pk_B, S_A, sk_A, z_A, z_A_index } = req.body;
  const S_B = await utils.rndHex(32);
  const { address } = req.headers;
  try {
    const { z_B, z_B_index, txObj } = await nfController.transfer(
      A,
      pk_B,
      S_A,
      S_B,
      sk_A,
      z_A,
      z_A_index,
      address,
    );
    res.data = {
      z_B,
      z_B_index,
      txObj,
      S_B,
    };
    next();
  } catch (err) {
    next(err);
  }
}

async function burn(req, res, next) {
  const { A, S_A, Sk_A, z_A, z_A_index, payTo } = req.body;
  const { address } = req.headers;
  try {
    await nfController.burn(
      A,
      Sk_A,
      S_A,
      z_A,
      z_A_index,
      address,
      payTo, // payed to same user.
    );
    res.data = {
      z_A,
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
    const { A, pk, S_A, z_A, z_A_index } = req.body;

    const results = await nfController.checkCorrectness(A, pk, S_A, z_A, z_A_index, address);
    res.data = results;
    next();
  } catch (err) {
    next(err);
  }
}

async function setTokenShieldAddress(req, res, next) {
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

async function getTokenShieldAddress(req, res, next) {
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

async function unsetTokenShieldAddress(req, res, next) {
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
router.post('/setNFTCommitmentShieldContractAddress', setTokenShieldAddress);
router.get('/getNFTCommitmentShieldContractAddress', getTokenShieldAddress);
router.delete('/removeNFTCommitmentshield', unsetTokenShieldAddress);

export default router;
