import { Router } from 'express';
import fTokenController from '../f-token-controller';

const router = Router();

async function mint(req, res, next) {
  const { amount } = req.body;
  const { address } = req.headers;

  try {
    const status = await fTokenController.buyFToken(amount, address);
    res.data = status;
    next();
  } catch (err) {
    next(err);
  }
}

async function transfer(req, res, next) {
  const { amount, toAddress } = req.body;
  const { address } = req.headers;

  try {
    const status = await fTokenController.transferFToken(amount, address, toAddress);
    res.data = status;
    next();
  } catch (err) {
    next(err);
  }
}

async function burn(req, res, next) {
  const { amount } = req.body;
  const { address } = req.headers;

  try {
    const status = await fTokenController.burnFToken(amount, address);
    res.data = status;
    next();
  } catch (err) {
    next(err);
  }
}

async function getAddress(req, res, next) {
  const { address } = req.headers;

  try {
    const ftAddress = await fTokenController.getFTAddress(address);
    res.data = {
      ftAddress,
    };
    next();
  } catch (err) {
    next(err);
  }
}

async function getInfo(req, res, next) {
  const { address } = req.headers;

  try {
    const balance = await fTokenController.getBalance(address);
    const { symbol, name } = await fTokenController.getTokenInfo(address);
    res.data = {
      balance,
      symbol,
      name,
    };
    next();
  } catch (err) {
    next(err);
  }
}

router.route('/mint').post(mint);
router.route('/transfer').post(transfer);
router.route('/burn').post(burn);
router.route('/address').get(getAddress);
router.route('/details').get(getInfo);

export default router;
