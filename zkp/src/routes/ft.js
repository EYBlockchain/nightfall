import {Router} from 'express';
import fTokenController from '../f-token-controller';

const router = Router();

async function mint(req, res, next) {
  const {value} = req.body;
  const {address} = req.headers;

  try {
    const status = await fTokenController.buyFToken(value, address);
    res.data = status;
    next();
  } catch (err) {
    next(err);
  }
}

async function transfer(req, res, next) {
  const {value, receiver} = req.body;
  const {address} = req.headers;

  try {
    const status = await fTokenController.transferFToken(value, address, receiver.address);
    res.data = status;
    next();
  } catch (err) {
    next(err);
  }
}

async function burn(req, res, next) {
  const {value} = req.body;
  const {address} = req.headers;

  try {
    const status = await fTokenController.burnFToken(value, address);
    res.data = status;
    next();
  } catch (err) {
    next(err);
  }
}

async function getAddress(req, res, next) {
  const {address} = req.headers;

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
  const {address} = req.headers;

  try {
    const balance = await fTokenController.getBalance(address);
    const {symbol, name} = await fTokenController.getTokenInfo(address);
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

router.post('/mintFToken', mint);
router.post('/transferFToken', transfer);
router.post('/burnFToken', burn);
router.get('/getFTokenContractAddress', getAddress);
router.get('/getFTokenInfo', getInfo);

export default router;
