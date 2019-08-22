import { Router } from 'express';
import fTokenController from '../f-token-controller';
import Response from '../../response'; // class for creating response object

const router = Router();

async function mint(req, res) {
  const { amount } = req.body;
  const { address } = req.headers;
  const response = new Response();

  try {
    const status = await fTokenController.buyFToken(amount, address);
    response.statusCode = 200;
    response.data = status;
    res.json(response);
  } catch (err) {
    console.log(err);
    response.statusCode = 500;
    response.data = err;
    res.status(500).json(response);
  }
}

async function transfer(req, res) {
  const { amount, toAddress } = req.body;
  const { address } = req.headers;
  const response = new Response();

  try {
    const status = await fTokenController.transferFToken(amount, address, toAddress);
    response.statusCode = 200;
    response.data = status;
    res.json(response);
  } catch (err) {
    console.log(err);
    response.statusCode = 500;
    response.data = err;
    res.status(500).json(response);
  }
}

async function burn(req, res) {
  const { amount } = req.body;
  const { address } = req.headers;
  const response = new Response();

  try {
    const status = await fTokenController.burnFToken(amount, address);
    response.statusCode = 200;
    response.data = status;
    res.json(response);
  } catch (err) {
    console.log(err);
    response.statusCode = 500;
    response.data = err;
    res.status(500).json(response);
  }
}

async function getAddress(req, res) {
  const { address } = req.headers;
  const response = new Response();

  try {
    const ftAddress = await fTokenController.getFTAddress(address);
    response.statusCode = 200;
    response.data = {
      ftAddress,
    };
    res.json(response);
  } catch (err) {
    console.log(err);
    response.statusCode = 500;
    response.data = err;
    res.status(500).json(response);
  }
}

async function getInfo(req, res) {
  const { address } = req.headers;
  const response = new Response();

  try {
    const balance = await fTokenController.getBalance(address);
    const { symbol, name } = await fTokenController.getTokenInfo(address);
    response.statusCode = 200;
    response.data = {
      balance,
      symbol,
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

router.route('/mint').post(mint);
router.route('/transfer').post(transfer);
router.route('/burn').post(burn);
router.route('/address').get(getAddress);
router.route('/details').get(getInfo);

export default router;
