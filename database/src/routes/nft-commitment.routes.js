import { NftCommitmentService } from '../business';

/**
 * This function will add new private token in db.
 * req.body {
 *  tokenId: '0xa23..',
 *  tokenUri: 'table/t1',
 *  salt: '0xE9A313C89C449AF6E630C25AB3ACC0FC3BAB821638E0D55599B518',
 *  commitment: '0xca2c0c099289896be4d72c74f801bed6e4b2cd5297bfcf29325484',
 *  commitmentIndex: 0,
 *  isMinted: true
 *  isReceived: true,
 * }
 * 'is_minted' or 'is_received' one at time will be present
 *  depending on new token is minted one or transferred one
 * @param {*} req
 * @param {*} res
 */
async function addTokenHandler(req, res, next) {
  try {
    const nftCommitmentService = new NftCommitmentService(req.user.db);
    await nftCommitmentService.addNewToken(req.body);
    res.data = { message: 'inserted' };
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * This function returns all the available private tokens
 * req.query {
 *  pageNo: 1,
 *  limit: 5
 * }
 * @param {*} req
 * @param {*} res
 */
async function getTokenHandler(req, res, next) {
  const nftCommitmentService = new NftCommitmentService(req.user.db);
  try {
    res.data = await nftCommitmentService.getToken(req.query);
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * This function will update a private token in db.
 * req.body {
 *  tokenId: '0xa23..',
 *  tokenUri: 'table/t1',
 *  salt: '0xE9A313C89C449AF6E630C25AB3ACC0FC3BAB821638E0D55599B518',
 *  commitment: '0xca2c0c099289896be4d72c74f801bed6e4b2cd5297bfcf29325484',
 *  commitmentIndex: 0,
 *  transferredSalt: '0xE9A313C89C449AF6E630C25AB3ACC0FC3BAB821638E0D55599B518',   [will be only present if is_transferred = true]
 *  transferredCommitment: '0xca2c0c099289896be4d72c74f801bed6e4b2cd5297bfcf29325484',   [will be only present if is_transferred = true]
 *  transferredCommitmentIndex: 1,                                                      [will be only present if is_transferred = true]
 *  receiver: 'bob',                                              [will be only present if is_transferred = true]
 *  isTransferred: true,
 *  isBurned: true
 * }
 * 'is_transferred' or 'is_burned' - one at time will be present
 *  depending on what kind of operation performend on the token.
 * @param {*} req
 * @param {*} res
 */
async function updateTokenHandler(req, res, next) {
  const nftCommitmentService = new NftCommitmentService(req.user.db);
  try {
    await nftCommitmentService.updateToken(req.body);
    res.data = { message: 'updated' };
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * This function returns all the private tokens transactions.
 * req.query = { pageNo: 1, limit: 5}
 * @param {*} req
 * @param {*} res
 */
async function getPrivateTokenTransactions(req, res, next) {
  const nftCommitmentService = new NftCommitmentService(req.user.db);
  try {
    res.data = await nftCommitmentService.getPrivateTokenTransactions(req.query);
    next();
  } catch (err) {
    next(err);
  }
}

// initializing routes
export default function(router) {
  router
    .route('/token')
    .post(addTokenHandler)
    .get(getTokenHandler)
    .patch(updateTokenHandler);

  router.route('/token/transaction').get(getPrivateTokenTransactions);
}
