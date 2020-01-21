import { FtCommitmentService } from '../business';

/**
 * This function is used to add a coin to the db.
 * req.body {
 * outputcommitments: [{
 *  value: '0x00000000000000000000000000000002',
 *  salt: '0x2149EA32C6839405C3A8461065554703D98B9DC921F88B99FF67AC',
 *  commitment: '0x677d27d8e4af2ec2f5468b7c69a0501d7e925ee4d36de9d732f723',
 *  commitmentIndex: '1',
 *  isMinted: true,
 * }]
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
 *  isBatchTransferred: true,
 *  isTransferred: true,
 *  outputCommitments: [
 *  owner: {
 *  receiver: {
 *     name: 'Bob'
 *   }
 *  }],
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
 *   inputCommitments: [
 *      {
 *      value: '0x00000000000000000000000000002710',
 *      salt: '0x14de022c9b4a437b346f04646bd7809deb81c38288e9614478351d',
 *      commitment: '0x39aaa6fe40c2106f49f72c67bc24d377e180baf3fe211c5c90e254',
 *      commitmentIndex: 0,
 *      owner,
 *      },
 *     {
 *       value: '0x00000000000000000000000000001388',
 *       salt: '0x14de022c9b4a437b346f04646bd7809deb81c38288e9614478351d',
 *       commitment: '0x39aaa6fe40c2106f49f72c67bc24d377e180baf3fe211c5c90e254',
 *       commitmentIndex: 1,
 *       owner,
 *      },
 *    ],
 *    outputCommitments: [
 *      {
 *        value: '0x00000000000000000000000000001770',
 *      },
 *      {
 *        value: '0x00000000000000000000000000002328',
 *      }
 *    ],
 *  receiver: {
 *    name: 'bob',
 *  },
 *  sender: {
 *    name: 'alice',
 *    publicKey: '0x70dd53411043c9ff4711ba6b6c779cec028bd43e6f525a25af36b8',
 *  },
 *  isTransferred: true,
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
