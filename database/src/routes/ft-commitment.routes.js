import Response from './response/response';
import { FtCommitmentService } from '../business';

/**
 * This function is used to add a coin to the db.
 * req.body {
 *  amount: '0x00000000000000000000000000000002',
 *  salt: '0x2149EA32C6839405C3A8461065554703D98B9DC921F88B99FF67AC',
 *  commitment: '0x677d27d8e4af2ec2f5468b7c69a0501d7e925ee4d36de9d732f723',
 *  commitmentIndex: '1',
 *  isMinted: true,
 * }
 * @param {*} req
 * @param {*} res
 */
async function addCoinHandler(req, res, next) {
  try {
    const ftCommitmentService = new FtCommitmentService(req.user.db);
    await ftCommitmentService.addNewCoin(req.body);
    const response = new Response(200, { message: 'inserted' }, null);
    res.json(response);
  } catch (err) {
    const response = new Response(500, null, { message: err.message });
    res.status(500).json(response);
    next(err);
  }
}

/**
 * This function is used to get coins associated with an public account
 * @param {*} req
 * @param {*} res
 */
async function getCoinHandler(req, res, next) {
  try {
    const ftCommitmentService = new FtCommitmentService(req.user.db);

    const coins = await ftCommitmentService.getCoin(req.query);

    const response = new Response(200, coins, null);
    res.json(response);
  } catch (err) {
    const response = new Response(500, null, { message: err.message });
    res.status(500).json(response);
    next(err);
  }
}

/**
 * This function will update the coin transaction once it is transferred.
 * req.body {
 *  amount: '0x00000000000000000000000000000003',
 *  salt: '0xc89cb4c18e4533e164e01d63b2bb3f115485aa52d8c5b220e88e31',
 *  commitment: '0xcaa89188896c93fc76b47721b27ab36bcc62805bce8026be0704d5',
 *  commitmentIndex: 0,
 *  transferredAmount: '0x00000000000000000000000000000013',
 *  transferredSalt: '0xD712C8800C085828BB5BA646465F1ACD1E4CC68F0458701696072E',
 *  transferredCommitment: '0xd179e1c20ab65ef3acf3644c8c57930e5b937980a80cc8645a9467',
 *  transferredCommitmentIndex: 2,
 *  changeAmount: '0x00000000000000000000000000000002',
 *  changeSalt: '0xAF868DBCFA1418A093A5B933B5459E28C274D03E141C79FB84ACE4',
 *  changeCommitment: '0xdde215a143549a1725d989d48988beb78c98fcfbbb4ffa1f91785b',
 *  changeCommitmentIndex: 3,
 *  transferee: bob,
 *  isTransferred: true,
 * }
 * @param {*} req
 * @param {*} res
 */
async function updateCoinHandler(req, res, next) {
  try {
    const ftCommitmentService = new FtCommitmentService(req.user.db);
    await ftCommitmentService.updateCoin(req.body);
    const response = new Response(200, { message: 'updated' }, null);
    res.json(response);
  } catch (err) {
    console.log(err);
    const response = new Response(500, null, { message: err.message });
    res.status(500).json(response);
    next(err);
  }
}

/**
 * This function returns all the coins transactions for a particular account
 * req.query {
 *  pageNo: 1,
 *  limit: 5
 * }
 * @param {*} req
 * @param {*} res
 */
async function getCoinTransactions(req, res, next) {
  try {
    const ftCommitmentService = new FtCommitmentService(req.user.db);
    const transactions = await ftCommitmentService.getCoinTransactions(req.query);
    const response = new Response(200, transactions, null);
    res.json(response);
  } catch (err) {
    const response = new Response(500, null, { message: err.message });
    res.status(500).json(response);
    next(err);
  }
}

/**
 * This function is called to add coin transaction of transfer type.
 * req.body {
 *  amount: '0x00000000000000000000000000000004',
 *  salt: '0xc89cb4c18e4533e164e01d63b2bb3f115485aa52d8c5b220e88e31',
 *  commitment: '0xcaa89188896c93fc76b47721b27ab36bcc62805bce8026be0704d5',
 *  commitmentIndex: 0,
 *  changeAmount: '0x00000000000000000000000000000001',
 *  changeSalt: '0xAF868DBCFA1418A093A5B933B5459E28C274D03E141C79FB84ACE4',
 *  changeCommitment: '0xdde215a143549a1725d989d48988beb78c98fcfbbb4ffa1f91785b',
 *  changeCommitmentIndex: 3,
 *  transferee: bob,
 *  isTransferred: true,
 *  usedCoins: [
 *    {
 *      amount: '0x00000000000000000000000000000002',
 *      commitment: '0xc89cb4c18e4533e164e01d63b2bb3f115485aa52d8c5b220e88e31',
 *    },
 *    {
 *      amount: '0x00000000000000000000000000000003',
 *      commitment: '0xc89cb4c18e4533e164e01d63b2bb3f115485aa52d8c5b220e88e31',
 *    }
 *  ]
 * }
 * @param {*} req
 * @param {*} res
 */
async function addCoinTransaction(req, res, next) {
  try {
    const ftCommitmentService = new FtCommitmentService(req.user.db);
    await ftCommitmentService.addCoinTransaction(req.body);
    const response = new Response(200, { message: 'inserted' }, null);
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
    .route('/coin')
    .post(addCoinHandler)
    .get(getCoinHandler)
    .patch(updateCoinHandler);

  router
    .route('/coin/transaction')
    .post(addCoinTransaction)
    .get(getCoinTransactions);
}
