import express from 'express';
import {
  newAccount,
  transferEtherToAccount,
  getBalance,
  unlockAccount,
  getCoinbaseAddress,
} from '../services/accounts';

const router = express.Router({ mergeParams: true });

/**
 * @api {post} /createAccount
 * @apiDescription This function is to create an account
 * @apiVersion 1.0.0
 * @apiName SignUp
 * @apiGroup User
 *
 * @apiParam (Request body) (Login) {String} password User specific password
 * @apiExample {json} Example usage:
 * req.body : {
 *    "password":"b"
 * }
 *
 * @apiSuccess [address] address Address Object returned as User address.
 * @apiSuccessExample {json} Success-Response:
 *  HTTP/1.1 200 OK
 *  {
 *    "0x48fB6f41fF365C8FE4450ED294876Dfa664F0416"
 *  }
 *
 * @param {*} req
 * @param {*} res
 */
async function createAccount(req, res, next) {
  const { password } = req.body;
  try {
    const address = await newAccount(password);
    if (password) {
      await transferEtherToAccount(address);
    }
    res.data = address;
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * @api {get} /getAccountBalance
 * @apiDescription This function is to get account balance
 * @apiVersion 1.0.0
 * @apiName getAccountBalance
 * @apiGroup User
 *
 * @apiParam (Request query) {Object} [address]  accountAddress   Address of the account
 * @apiExample {json} Example usage:
 * req.query : {
 *  accountAddress: "0x48fB6f41fF365C8FE4450ED294876Dfa664F0416"
 * }
 *
 * @apiSuccess {Number} balance Account balance.
 * @apiSuccessExample {json} Success-Response:
 *  HTTP/1.1 200 OK
 *  {
 *    "1000000000000"
 *  }
 *
 * @param {*} req
 * @param {*} res
 */
async function getAccountBalance(req, res, next) {
  const { accountAddress } = req.query;
  const balance = await getBalance(accountAddress);
  res.data = balance;
  next();
}

/**
 * This function is to transfer ether to an account
 * @param {*} req
 * @param {*} res
 */

/**
 * @api {get} /transferEther
 * @apiDescription This function is to transfer ether to an account
 * @apiVersion 1.0.0
 * @apiName transferEther
 * @apiGroup User
 *
 * @apiParam (Request query) {Object} [address] from      Sender account address
 * @apiParam (Request query) {Object} [address] address   Receiver account address
 * @apiParam (Request query) {Number}           amount    Amount transferring
 *
 * @apiExample {json} Example usage:
 * req.query : {
 *  from: "0x48fB6f41fF365C8FE4450ED294876Dfa664F0416",
 *  amount: "0000000000014",
 *  address: "0x28fB6f41fF365C8FE4450ED294876Dfa664F0753"
 * }
 *
 * @apiSuccess {String} txHash Hash of the transaction.
 * @apiSuccessExample {json} Success-Response:
 *  HTTP/1.1 200 OK
 *  {
 *    txHash: "0xef95f2f1ed3ca60b048b4bf67cde2195961e0bba6f70bcbea9a2c4e133e34b46"
 *  }
 *
 * @param {*} req
 * @param {*} res
 */
async function transferEther(req, res, next) {
  const { from, amount, address } = req.body;
  try {
    const txHash = await transferEtherToAccount(address, from, amount);
    res.data = txHash;
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * @api {post} /unlockUserAccount
 * @apiDescription This function is to unloack an account
 * @apiVersion 1.0.0
 * @apiName unlockUserAccount
 * @apiGroup User
 *
 * @apiParam (Request body) address address Address of User
 * @apiParam (Request body) {String} password User specific password
 * @apiExample {json} Example usage:
 * req.body : {
 *    "address":"0x48fB6f41fF365C8FE4450ED294876Dfa664F0416",
 *    "password":"b"
 * }
 *
 * @apiSuccess {String} message Successfully unlocked message.
 * @apiSuccessExample {json} Success-Response:
 *  HTTP/1.1 200 OK
 *  {
 *    "message":"Unlocked"
 *  }
 *
 * @param {*} req
 * @param {*} res
 */
async function unlockUserAccount(req, res, next) {
  const { address, password } = req.body;

  try {
    await unlockAccount(address, password);
    res.data = { message: 'Unlocked' };
    next();
  } catch (err) {
    next(err);
  }
}

async function getCoinbase(req, res, next) {
  try {
    res.data = await getCoinbaseAddress();
    next();
  } catch (err) {
    next(err);
  }
}

router.post('/createAccount', createAccount);
router.get('/getAccountBalance', getAccountBalance);
router.post('/unlockAccount', unlockUserAccount);
router.post('/transferEther', transferEther);
router.get('/getCoinbase', getCoinbase);

export default router;
