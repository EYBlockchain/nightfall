/* eslint-disable camelcase */

import { Router } from 'express';
import utils from 'zkp-utils';
import fTokenController from '../f-token-controller';

const router = Router();

async function mint(req, res, next) {
  const { address } = req.headers;
  const { A, pk_A } = req.body;
  const S_A = await utils.rndHex(27);

  try {
    const [coin, coin_index] = await fTokenController.mint(A, pk_A, S_A, address);
    res.data = {
      coin,
      coin_index,
      S_A,
    };
    next();
  } catch (err) {
    next(err);
  }
}

async function transfer(req, res, next) {
  const { address } = req.headers;
  const { C, D, E, F, pk_B, S_C, S_D, sk_A, z_C, z_C_index, z_D, z_D_index } = req.body;
  const S_E = await utils.rndHex(27);
  const S_F = await utils.rndHex(27);
  try {
    const { z_E, z_E_index, z_F, z_F_index, txObj } = await fTokenController.transfer(
      C,
      D,
      E,
      F,
      pk_B,
      S_C,
      S_D,
      S_E,
      S_F,
      sk_A,
      z_C,
      z_C_index,
      z_D,
      z_D_index,
      address,
    );
    res.data = {
      z_E,
      z_E_index,
      z_F,
      z_F_index,
      txObj,
      S_E,
      S_F,
    };
    next();
  } catch (err) {
    next(err);
  }
}

async function burn(req, res, next) {
  const { A, sk_A, S_A, z_A, z_A_index, payTo } = req.body;
  const { address } = req.headers;

  try {
    await fTokenController.burn(A, sk_A, S_A, z_A, z_A_index, address, payTo);
    res.data = {
      z_C: z_A,
      z_C_index: z_A_index,
    };
    next();
  } catch (err) {
    next(err);
  }
}

async function checkCorrectness(req, res, next) {
  console.log('\nzkp/src/restapi', '\n/coin/checkCorrectness', '\nreq.body', req.body);

  try {
    const { address } = req.headers;
    const { E, pk, S_E, z_E, z_E_index } = req.body;

    const results = await fTokenController.checkCorrectness(E, pk, S_E, z_E, z_E_index, address);
    console.log('\nzkp/src/restapi', '\n/coin/checkCorrectness', '\nresults', results);

    res.data = results;
    next();
  } catch (err) {
    next(err);
  }
}

async function setCoinShieldAddress(req, res, next) {
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

async function getCoinShieldAddress(req, res, next) {
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

async function unsetCoinShieldAddress(req, res, next) {
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

router.route('/mint').post(mint);
router.route('/transfer').post(transfer);
router.route('/burn').post(burn);
router.route('/checkCorrectness').post(checkCorrectness);
router
  .route('/shield')
  .post(setCoinShieldAddress)
  .get(getCoinShieldAddress)
  .delete(unsetCoinShieldAddress);

export default router;
