import { Router } from 'express';
import fTokenController from '../f-token-controller';

const router = Router();

/**
 * @api {post} /mintFToken
 * @apiDescription This function is to mint a fungible token
 * @apiVersion 1.0.0
 * @apiName mintFToken
 *
 * @apiParam (Request body) {Number} value  ft commitment to be minted
 * @apiExample {json} Example usage:
 * req.body = {
 *  value: 20,
 * }
 *
 * @apiSuccess (Success 200) {String} message Mint Successful.
 *
 * @apiSuccessExample {json} Success-Response:
 * HTTPS 200 OK
 * {
 *		"message": "Mint Successful"
 * }
 *
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
 * @api {post} /transferFToken
 * @apiDescription This function is to transfer a fungible token to a receiver
 * @apiVersion 1.0.0
 * @apiName transferFToken
 *
 * @apiParam (Request body) {Number} value  ft commitment to be minted
 * @apiParam (Request body) {Object} receiver The name of the Receiver.
 * @apiExample {json} Example usage:
 * req.body = {
 *  value: 20,
 *  receiver: {
 *    name: 'bob'
 *    address: '0x3915e408fd5cff354fd73549d31a4bc66f7335db59bc4e84001473'
 *  }
 * }
 *
 * @apiSuccess (Success 200) {String} message Transfer Successful.
 *
 * @apiSuccessExample {json} Success-Response:
 * HTTPS 200 OK
 * {
 *		"message": "transfer Successful"
 * }
 *
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
 * @api {post} /burnFToken
 * @apiDescription This function is to burn a fungible token
 * @apiVersion 1.0.0
 * @apiName burnFToken
 *
 * @apiParam (Request body) {Number} value  ft commitment to be minted
 * @apiExample {json} Example usage:
 * req.body = {
 *  value: 20,
 * }
 *
 * @apiSuccess (Success 200) {String} message Burn Successful.
 *
 * @apiSuccessExample {json} Success-Response:
 * HTTPS 200 OK
 * {
 *		"message": "Burn Successful"
 * }
 *
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
 * res.data = {
 *   ftAddress : 0xa34eaa922ae0039f6e1dc1216aba285f4b161cf408eb3966f597114b0f6abd72
 * }
 *
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
 * res.data : {
 *  "balance":"0",
 *  "symbol":"OPS",
 *  "name":"EY OpsCoin"
 * }
 *
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
