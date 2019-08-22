import Response from './response/response';
import { NftService } from '../business';

/**
 * This function will add new ERC 721 token in db.
 * req.body {
 *  uri: 'table/t1',
 *  tokenId: '0xa23..',
 *  shieldContractAddress: '0x12b..',
 *  isMinted: true,
 *  isReceived: true,
 *  transferor: 'alice',    [will be only present if is_received = true]
 *  transferorAddress: '0x34a'    [will be only present if is_received = true]
 * }
 * 'is_minted' or 'is_received' one at time will be present
 *  depending on new token is minted one or transferred one
 * @param {*} req
 * @param {*} res
 */
async function addNFToken(req, res, next) {
  try {
    const nftService = new NftService(req.user.db);
    await nftService.addNFToken(req.body);
    const response = new Response(200, { message: 'inserted' }, null);
    res.json(response);
  } catch (err) {
    const response = new Response(500, null, { message: err.message });
    res.status(500).json(response);
    next(err);
  }
}

/**
 * This function will update ERC 721 token in db.
 * req.body {
 *  uri: 'table/t1',
 *  tokenId: '0xa23..',
 *  shieldContractAddress: '0x12b..',
 *  transferee: 'bob'   [will be only present if is_transferred = true]
 *  transfereeAddress: '0x34a'   [will be only present if is_transferred = true]
 *  isTransferred: true,
 *  isBurned: true,
 *  isShielded: true
 * }
 * 'is_transferred' or 'is_burned' or 'is_shielded' - one at time will be present
 *  depending on what kind of operation performend on the token.
 * @param {*} req
 * @param {*} res
 */
async function updateNFToken(req, res, next) {
  try {
    const nftService = new NftService(req.user.db);
    await nftService.updateNFToken(req.body);
    const response = new Response(200, { message: 'updated' }, null);
    res.json(response);
  } catch (err) {
    const response = new Response(500, null, { message: err.message });
    res.status(500).json(response);
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
    const tokens = await nftService.getNFTokens(req.query);
    const response = new Response(200, tokens, null);
    res.json(response);
  } catch (err) {
    const response = new Response(500, null, { message: err.message });
    res.status(500).json(response);
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
    const transactions = await nftService.getNFTTransactions(req.query);
    const response = new Response(200, transactions, null);
    res.json(response);
  } catch (err) {
    const response = new Response(500, null, { message: err.message });
    res.status(500).json(response);
    next(err);
  }
}

/**
 * This function returns a specfic ERC 721 token by token_id, to get its detail.
 * req.params {
 *  token_id: '0xa23..'
 * }
 * @param {*} req
 * @param {*} res
 */
async function getNFToken(req, res, next) {
  try {
    const nftService = new NftService(req.user.db);
    const token = await nftService.getNFToken(req.params.tokenId);
    const response = new Response(200, { token }, null);
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
    .route('/nft')
    .post(addNFToken)
    .patch(updateNFToken)
    .get(getNFTokens);

  router.route('/nft/transaction').get(getNFTTransactions);
  router.route('/nft/:tokenId').get(getNFToken);
}
