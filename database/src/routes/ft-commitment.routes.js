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
async function insertFTCommitment(req, res, next) {
  try {
    const ftCommitmentService = new FtCommitmentService(req.user.db);
    await ftCommitmentService.insertFTCommitment(req.body);
    res.data = { message: 'inserted' };
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * This function is used to get coins associated with an public account
 * @param {*} req
 * @param {*} res
 */
async function getFTCommitments(req, res, next) {
  try {
    const ftCommitmentService = new FtCommitmentService(req.user.db);
    res.data = await ftCommitmentService.getFTCommitments(req.query);
    next();
  } catch (err) {
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
 *  receiver: bob,
 *  isTransferred: true,
 * }
 * @param {*} req
 * @param {*} res
 */
async function updateFTCommitmentByCommitmentHash(req, res, next) {
  const { commitmentHash } = req.params;
  try {
    const ftCommitmentService = new FtCommitmentService(req.user.db);
    await ftCommitmentService.updateFTCommitmentByCommitmentHash(commitmentHash, req.body);
    res.data = { message: 'updated' };
    next();
  } catch (err) {
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
async function getFTCommitmentTransactions(req, res, next) {
  try {
    const ftCommitmentService = new FtCommitmentService(req.user.db);
    res.data = await ftCommitmentService.getFTCommitmentTransactions(req.query);
    next();
  } catch (err) {
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
 *  receiver: bob,
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
async function insertFTCommitmentTransaction(req, res, next) {
  try {
    const ftCommitmentService = new FtCommitmentService(req.user.db);
    await ftCommitmentService.insertFTCommitmentTransaction(req.body);
    res.data = { message: 'inserted' };
    next();
  } catch (err) {
    next(err);
  }
}

// initializing routes
export default function(router) {
  router
    .route('/ft-commitments')
    .post(insertFTCommitment)
    .get(getFTCommitments);

  router.patch('/ft-commitments/:commitmentHash', updateFTCommitmentByCommitmentHash);

  router
    .route('/ft-commitments/transactions')
    .post(insertFTCommitmentTransaction)
    .get(getFTCommitmentTransactions);
}
