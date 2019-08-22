import Response from './response/response';
import { FtService } from '../business';

/**
 * This function add ERC-20 transactions in database
 * req.body = {
 *  amount: 20,
 *  shieldContractAddress: "0x033..",
 *  transferee: "BOB",
 *  transfereeAddress: "0xb0b",
 *  transferor: "ALICE",
 *  transferorAddress: "0xA71CE"
 * }
 * @param {*} req
 * @param {*} res
 */
async function addFTTransaction(req, res, next) {
  try {
    const ftService = new FtService(req.user.db);
    await ftService.addFTokenTransaction(req.body);
    const response = new Response(200, { message: 'inserted' }, null);
    res.json(response);
  } catch (err) {
    const response = new Response(500, null, { message: err.message });
    res.status(500).json(response);
    next(err);
  }
}

/**
 * This function returns all the Coins transactions
 * req.query = { pageNo: 1, limit: 5}
 * @param {*} req
 * @param {*} res
 */
async function getFTTransactions(req, res, next) {
  const ftService = new FtService(req.user.db);
  try {
    const transactions = await ftService.getFTTransactions(req.query);
    const response = new Response(200, transactions, null);
    res.json(response);
  } catch (err) {
    const response = new Response(500, null, { message: err.message });
    res.status(500).json(response);
    next(err);
  }
}

// initializing routes
export default function(router) {
  router
    .route('/ft/transaction')
    .post(addFTTransaction)
    .get(getFTTransactions);
}
