import { FtService } from '../business';

/**
 * This function add ERC-20 transactions in database
 * req.body = {
 *  value: 20,
 *  shieldContractAddress: "0x033..",
 *  receiver: {
 *   name: "Bob",
 *   address: "0xb0b",
 *  }
 *  sender: {
 *   name: "Alice",
 *   address: "0xb0b",
 *  }
 * }
 * @param {*} req
 * @param {*} res
 */
async function insertFTTransaction(req, res, next) {
  try {
    const ftService = new FtService(req.user.db);
    await ftService.insertFTokenTransaction(req.body);
    res.data = { message: 'inserted' };
    next();
  } catch (err) {
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
    res.data = await ftService.getFTTransactions(req.query);
    next();
  } catch (err) {
    next(err);
  }
}

// initializing routes
export default function(router) {
  router
    .route('/fts/transactions')
    .post(insertFTTransaction)
    .get(getFTTransactions);
}
