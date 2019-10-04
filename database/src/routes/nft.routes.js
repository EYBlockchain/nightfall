import { NftService } from '../business';

/**
 * This function will add new ERC 721 token in db.
 * req.body {
 *  uri: 'table/t1',
 *  tokenId: '0xa23..',
 *  shieldContractAddress: '0x12b..',
 *  isMinted: true,
 *  isReceived: true,
 *  sender: 'alice',    [will be only present if is_received = true]
 *  senderAddress: '0x34a'    [will be only present if is_received = true]
 * }
 * 'is_minted' or 'is_received' one at time will be present
 *  depending on new token is minted one or transferred one
 * @param {*} req
 * @param {*} res
 */
async function insertNFToken(req, res, next) {
  try {
    const nftService = new NftService(req.user.db);
    await nftService.addNFToken(req.body);
    res.data = { message: 'inserted' };
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * This function will update ERC 721 token in db.
 * req.body {
 *  uri: 'table/t1',
 *  tokenId: '0xa23..',
 *  shieldContractAddress: '0x12b..',
 *  receiver: 'bob'   [will be only present if is_transferred = true]
 *  receiverAddress: '0x34a'   [will be only present if is_transferred = true]
 *  isTransferred: true,
 *  isBurned: true,
 *  isShielded: true
 * }
 * 'is_transferred' or 'is_burned' or 'is_shielded' - one at time will be present
 *  depending on what kind of operation performend on the token.
 * @param {*} req
 * @param {*} res
 */
async function updateNFTokenByTokenId(req, res, next) {
  const { tokenId } = req.params;
  try {
    const nftService = new NftService(req.user.db);
    await nftService.updateNFTokenByTokenId(tokenId, req.body);
    res.data = { message: 'updated' };
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * This method to list down all public NFT Tokens (ERC 721)
 * with or without pagination.
 * if pagination "pageNo" and "limit" will be present
 * otherwise not.
 * req.query {
 *  pageNo: 1,
 *  limit: 5,
 *  shieldContractAddress: '0x54C..'
 * }
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
async function getNFTokens(req, res, next) {
  try {
    const nftService = new NftService(req.user.db);
    res.data = await nftService.getNFTokens(req.query);
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * This function returns all the ERC 721 tokens transactions.
 * req.query {
 *  pageNo: 1,
 *  limit: 5
 * }
 * @param {*} req
 * @param {*} res
 */
async function getNFTTransactions(req, res, next) {
  const nftService = new NftService(req.user.db);
  try {
    res.data = await nftService.getNFTTransactions(req.query);
    next();
  } catch (err) {
    next(err);
  }
}

// initializing routes
export default function(router) {
  router
    .route('/nfts')
    .post(insertNFToken)
    .get(getNFTokens);

  router.patch('/nfts/:tokenId', updateNFTokenByTokenId);

  router.get('/nfts/transactions', getNFTTransactions);
}
