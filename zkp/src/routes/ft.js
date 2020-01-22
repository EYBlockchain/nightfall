import { Router } from 'express';
import fTokenController from '../f-token-controller';

const router = Router();

/**
 * This function is to mint a fungible token
 * req.body = {
 *  value: 20,
 * }
 * @param {*} req
 * @param {*} res
 */
async function mint(req, res, next) {
  const { value } = req.body;
  const { address } = req.headers;

  try {
    const status = await fTokenController.buyFToken(value, address);
    res.data = status;
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * This function is to transfer a fungible token to a receiver
 * req.body = {
 *  value: 20,
 *  receiver: {
 *    name: 'bob'
 *    address: '0x3915e408fd5cff354fd73549d31a4bc66f7335db59bc4e84001473'
 *  }
 * }
 * @param {*} req
 * @param {*} res
 */
async function transfer(req, res, next) {
  const { value, receiver } = req.body;
  const { address } = req.headers;

  try {
    const status = await fTokenController.transferFToken(value, address, receiver.address);
    res.data = status;
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * This function is to burn a fungible token
 * req.body = {
 *  value: 20,
 * }
 * @param {*} req
 * @param {*} res
 */
async function burn(req, res, next) {
  const { value } = req.body;
  const { address } = req.headers;

  try {
    const status = await fTokenController.burnFToken(value, address);
    res.data = status;
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * This function is to retrieve address of a fungible token
 * @param {*} req
 * @param {*} res
 */
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

/**
 * This function is to retrieve information of a fungible token
 * @param {*} req
 * @param {*} res
 */
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

router.post('/mintFToken', mint);
router.post('/transferFToken', transfer);
router.post('/burnFToken', burn);
router.get('/getFTokenContractAddress', getAddress);
router.get('/getFTokenInfo', getInfo);

export default router;
