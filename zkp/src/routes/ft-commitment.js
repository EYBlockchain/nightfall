/* eslint-disable camelcase */

import { Router } from 'express';
import Utils from 'zkp-utils';
import fTokenController from '../f-token-controller';
import Response from '../../response'; // class for creating response object

const utils = Utils('/app/config/stats.json');
const router = Router();

async function mint(req, res) {
  const { address } = req.headers;
  const { A, pk_A } = req.body;
  const S_A = await utils.rndHex(27);
  const response = new Response();

  try {
    const [coin, coin_index] = await fTokenController.mint(A, pk_A, S_A, address);
    response.statusCode = 200;
    response.data = {
      coin,
      coin_index,
      S_A,
    };
    res.json(response);
  } catch (err) {
    console.log(err);
    response.statusCode = 500;
    response.data = err;
    res.status(500).json(response);
  }
}

async function transfer(req, res) {
  const { address } = req.headers;
  const { C, D, E, F, pk_B, S_C, S_D, sk_A, z_C, z_C_index, z_D, z_D_index } = req.body;
  const S_E = await utils.rndHex(27);
  const S_F = await utils.rndHex(27);
  const response = new Response();
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
    response.statusCode = 200;
    response.data = {
      z_E,
      z_E_index,
      z_F,
      z_F_index,
      txObj,
      S_E,
      S_F,
    };
    res.json(response);
  } catch (err) {
    console.log(err);
    response.statusCode = 500;
    response.data = err;
    res.status(500).json(response);
  }
}

async function burn(req, res) {
  const { A, sk_A, S_A, z_A, z_A_index, payTo } = req.body;
  const { address } = req.headers;

  const response = new Response();
  try {
    await fTokenController.burn(A, sk_A, S_A, z_A, z_A_index, address, payTo);
    response.statusCode = 200;
    response.data = {
      z_C: z_A,
      z_C_index: z_A_index,
    };
    res.json(response);
  } catch (err) {
    console.log(err);
    response.statusCode = 500;
    response.data = err;
    res.status(500).json(response);
  }
}

async function checkCorrectness(req, res) {
  const response = new Response();
  console.log('\nzkp/src/restapi', '\n/coin/checkCorrectness', '\nreq.body', req.body);

  try {
    const { address } = req.headers;
    const { E, pk, S_E, z_E, z_E_index } = req.body;

    const results = await fTokenController.checkCorrectness(E, pk, S_E, z_E, z_E_index, address);
    console.log('\nzkp/src/restapi', '\n/coin/checkCorrectness', '\nresults', results);

    response.statusCode = 200;
    response.data = results;
    res.json(response);
  } catch (err) {
    console.log(err);
    response.statusCode = 500;
    response.data = err;
    res.status(500).json(response);
  }
}

async function setCoinShieldAddress(req, res) {
  const { address } = req.headers;
  const { coinShield } = req.body;

  const response = new Response();

  try {
    await fTokenController.setShield(coinShield, address);
    await fTokenController.getBalance(address);
    response.statusCode = 200;
    response.data = {
      message: 'CoinShield Address Set.',
    };
    res.json(response);
  } catch (err) {
    console.log('/coin/shield', err);
    fTokenController.unSetShield(address);
    response.statusCode = 500;
    response.data = err;
    res.status(500).json(response);
  }
}

async function getCoinShieldAddress(req, res) {
  const { address } = req.headers;
  const response = new Response();

  try {
    const shieldAddress = await fTokenController.getShieldAddress(address);
    const { name } = await fTokenController.getTokenInfo(address);
    response.statusCode = 200;
    response.data = {
      shieldAddress,
      name,
    };
    res.json(response);
  } catch (err) {
    console.log(err);
    response.statusCode = 500;
    response.data = err;
    res.status(500).json(response);
  }
}

async function unsetCoinShieldAddress(req, res) {
  const { address } = req.headers;
  const response = new Response();

  try {
    fTokenController.unSetShield(address);
    response.statusCode = 200;
    response.data = {
      message: 'CoinShield Address Unset.',
    };
    res.json(response);
  } catch (err) {
    response.statusCode = 500;
    response.data = err;
    res.status(500).json(response);
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
