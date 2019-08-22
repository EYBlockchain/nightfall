/* eslint-disable camelcase */

import { Router } from 'express';
import Utils from 'zkp-utils';
import nfController from '../nf-token-controller';
import Response from '../../response'; // class for creating response object

const utils = Utils('/app/config/stats.json');
const router = Router();

async function mint(req, res) {
  const { address } = req.headers;
  const { A, pk_A } = req.body;
  const S_A = await utils.rndHex(27);
  const response = new Response();

  try {
    const [z_A, z_A_index] = await nfController.mint(A, pk_A, S_A, address);

    response.statusCode = 200;
    response.data = {
      z_A,
      z_A_index,
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
  const { A, pk_B, S_A, sk_A, z_A, z_A_index } = req.body;
  const S_B = await utils.rndHex(27);
  const { address } = req.headers;
  const response = new Response();
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

    response.statusCode = 200;
    response.data = {
      z_B,
      z_B_index,
      txObj,
      S_B,
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
  const { A, S_A, Sk_A, z_A, z_A_index, payTo } = req.body;
  const { address } = req.headers;
  const response = new Response();
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
    response.statusCode = 200;
    response.data = {
      z_A,
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
  console.log('\nzkp/src/restapi', '\n/token/checkCorrectness', '\nreq.body', req.body);

  try {
    const { address } = req.headers;
    const { A, pk, S_A, z_A, z_A_index } = req.body;

    const results = await nfController.checkCorrectness(A, pk, S_A, z_A, z_A_index, address);
    console.log('\nzkp/src/restapi', '\n/token/checkCorrectness', '\nresults', results);

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

async function setTokenShieldAddress(req, res) {
  const { address } = req.headers;
  const { tokenShield } = req.body;
  const response = new Response();

  try {
    await nfController.setShield(tokenShield, address);
    await nfController.getNFTName(address);
    response.statusCode = 200;
    response.data = {
      message: 'TokenShield Address Set.',
    };
    res.json(response);
  } catch (err) {
    console.log('/token/shield', err);
    nfController.unSetShield(address);
    response.statusCode = 500;
    response.data = err;
    res.status(500).json(response);
  }
}

async function getTokenShieldAddress(req, res) {
  const { address } = req.headers;
  const response = new Response();

  try {
    const shieldAddress = await nfController.getShieldAddress(address);
    const name = await nfController.getNFTName(address);
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

async function unsetTokenShieldAddress(req, res) {
  const { address } = req.headers;
  const response = new Response();

  try {
    nfController.unSetShield(address);
    response.statusCode = 200;
    response.data = {
      message: 'TokenShield Address Unset.',
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
  .post(setTokenShieldAddress)
  .get(getTokenShieldAddress)
  .delete(unsetTokenShieldAddress);

export default router;
