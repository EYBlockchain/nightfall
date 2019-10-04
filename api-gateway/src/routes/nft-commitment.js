import express from 'express';
import {
  checkCorrectnessToken,
  mintToken,
  transferToken,
  burnToken,
  insertNFTCommitmentToDb,
  getNFTCommitmentTransactions,
  getNFTCommitments,
} from '../services/nft-commitment';

const router = express.Router();

router.route('/checkCorrectnessForNFTCommitment').post(checkCorrectnessToken);

/**
 * @api {post} /mintNFTCommitment Mint a ERC-721 commitment
 * @apiVersion 1.0.0
 * @apiName  Mint a ERC-721 commitment
 * @apiGroup ERC-721 commitment
 *
 * @apiParam (Request body) {String} uri URI of token.
 * @apiParam (Request body) {String} tokenID unique ERC-721 token Id.
 * @apiParam (Request body) {String} S_A Random generated Salt.
 *
 * @apiExample {js} Example usage:
 * const data = {
 *    S_A: '0xE9A313C89C449AF6E630C25AB3ACC0FC3BAB821638E0D55599B518',
 *    uri: 'unique token name',
 *    tokenID: '0x1448d8ab4e0d610000000000000000000000000000000000000000000000000'
 * }
 *
 * $http.post(url, data)
 *   .success((res, status) => doSomethingHere())
 *   .error((err, status) => doSomethingHere());
 *
 * @apiSuccess (Success 200) {String} z_A Token commitment number.
 * @apiSuccess (Success 200) {Number} z_A_index token index value from blockchain.
 *
 * @apiSuccessExample {json} Success response:
 *     HTTPS 200 OK
 *	  {
 *		"z_A":"0x5b531cd1a758cf33affd093fcdb3864bfa72f7717f593a8d7d0118",
 *		"z_A_index":"0"
 *	  }
 */
router.route('/mintNFTCommitment').post(mintToken);

/**
 * @api {post} /transferNFTCommitment Transfer a ERC-721 commitment
 * @apiVersion 1.0.0
 * @apiName  Transfer a ERC-721 commitment
 * @apiGroup ERC-721 commitment
 *
 * @apiParam (Request body) {String} A Hex String of token.
 * @apiParam (Request body) {String} uri URI of token.
 * @apiParam (Request body) {String} S_A Salt of token A.
 * @apiParam (Request body) {String} S_B Random generated Salt.
 * @apiParam (Request body) {String} sk_A Secret key of Transferror (Alice).
 * @apiParam (Request body) {String} pk_B Public key of Receiver (Bob).
 * @apiParam (Request body) {String} z_A Token commitment of token A.
 * @apiParam (Request body) {String} z_A_index Token index of token A.
 * @apiParam (Request body) {String} receiver_name Receiver name.
 *
 * @apiExample {js} Example usage:
 * const data = {
 *    A: '0x1448d8ab4e0d610000000000000000000000000000000000000000000000000',
 *    uri: 'unique token name',
 *    S_A: '0xe9a313c89c449af6e630c25ab3acc0fc3bab821638e0d55599b518',
 *    S_B: '0xF4C7028D78D140333A36381540E70E6210895A994429FB0483FB91',
 *    sk_A: '0xcf6267b9393a8187ab72bf095e9ffc34af1a5d3d069b9d26e21eac',
 *    z_A: '0xca2c0c099289896be4d72c74f801bed6e4b2cd5297bfcf29325484',
 *    receiver_name: 'bob',
 *    z_A_index: 0,
 *    pk_B: '0xebbabcc471780d9581451e1b2f03bb54638800dd441d1e5c2344f8'
 * }
 *
 * $http.post(url, data)
 *   .success((res, status) => doSomethingHere())
 *   .error((err, status) => doSomethingHere());
 *
 * @apiSuccess (Success 200) {String} z_B Token commitment number.
 * @apiSuccess (Success 200) {Number} z_B_index token index value from blockchain.
 *
 * @apiSuccessExample {json} Success response:
 *     HTTPS 200 OK
 *	  {
 *		"z_B":"0x5b531cd1a758cf33affd093fcdb3864bfa72f7717f593a8d7d0118",
 *		"z_B_index":"1"
 *	  }
 */
router.route('/transferNFTCommitment').post(transferToken);

/**
 * @api {post} /burnNFTCommitment Burn a ERC-721 commitment
 * @apiVersion 1.0.0
 * @apiName  Burn a ERC-721 commitment
 * @apiGroup ERC-721 commitment
 *
 * @apiParam (Request body) {String} A Hex String of token.
 * @apiParam (Request body) {String} uri URI of token.
 * @apiParam (Request body) {String} S_A Salt of token A.
 * @apiParam (Request body) {String} sk_A Secret key of Transferror (Alice).
 * @apiParam (Request body) {String} z_A Token commitment of token A.
 * @apiParam (Request body) {String} z_A_index Token index of token A.
 *
 * @apiExample {js} Example usage:
 * const data = {
 *    A: '0x1448d8ab4e0d610000000000000000000000000000000000000000000000000',
 *    uri: 'unique token name',
 *    S_A: '0xe9a313c89c449af6e630c25ab3acc0fc3bab821638e0d55599b518',
 *    sk_A: '0xcf6267b9393a8187ab72bf095e9ffc34af1a5d3d069b9d26e21eac',
 *    z_A: '0xca2c0c099289896be4d72c74f801bed6e4b2cd5297bfcf29325484',
 *    z_A_index: 0,
 * }
 *
 * $http.post(url, data)
 *   .success((res, status) => doSomethingHere())
 *   .error((err, status) => doSomethingHere());
 *
 * @apiSuccess (Success 200) {String} message burn message.
 *
 * @apiSuccessExample {json} Success response:
 *     HTTPS 200 OK
 *	  {
 *		"message":"burn successful"
 *	  }
 */
router.route('/burnNFTCommitment').post(burnToken);

router
  .route('/')
  /**
   * @api {post} /token Insert ERC-721 commitment in database
   * @apiVersion 1.0.0
   * @apiName  Insert ERC-721 commitment
   * @apiGroup ERC-721 commitment
   *
   * @apiParam (Request body) {String} tokenId Hex String of token.
   * @apiParam (Request body) {String} tokenUri URI of token.
   * @apiParam (Request body) {String} salt Salt of token A.
   * @apiParam (Request body) {String} commitment Token commitment of token A.
   * @apiParam (Request body) {String} commitmentIndex Token index of token A.
   * @apiParam (Request body) {Boolean} isMinted if data is for minted token.
   * @apiParam (Request body) {Bolean} isReceived if data is transaferred token.
   *
   * @apiExample {js} Example usage:
   * const data = {
   *    tokenId: '0x1448d8ab4e0d610000000000000000000000000000000000000000000000000',
   *    tokenUri: 'unique token name',
   *    salt: '0xe9a313c89c449af6e630c25ab3acc0fc3bab821638e0d55599b518',
   *    commitment: '0xca2c0c099289896be4d72c74f801bed6e4b2cd5297bfcf29325484',
   *    commitmentIndex: 0,
   *    isMinted: true  
   *    isReceived: true

   * }
   *
   * $http.post(url, data)
   *   .success((res, status) => doSomethingHere())
   *   .error((err, status) => doSomethingHere());
   *
   * @apiSuccess (Success 200) {String} message status message.
   *
   * @apiSuccessExample {json} Success response:
   *     HTTPS 200 OK
   *    {
   *    "message":"inserted"
   *    }
   */
  .post(insertNFTCommitmentToDb)
  /**
   * @api {get} /token fetch ERC-721 commitments from database
   * @apiVersion 1.0.0
   * @apiName  List all ERC-721 commitments
   * @apiGroup ERC-721 commitment
   *
   * @apiParam (Request query) {String} limit page size (optional).
   * @apiParam (Request query) {String} pageNo page number (optional).

   *
   * @apiExample {js} Example usage:
   * const qyery = {
   *    limit: '12',
   *    pageNo: 2
   * }
   *
   * $http.post(url, data)
   *   .success((res, status) => doSomethingHere())
   *   .error((err, status) => doSomethingHere());
   *
   * @apiSuccess (Success 200) {Array} data ERC-721 commitments.
   * @apiSuccess (Success 200) {Array} totalCount Total no. of tokens.
   *
   * @apiSuccessExample {json} Success response:
   *     HTTPS 200 OK
   *    {
   *      "data":[
   *        {
   *          "_id":"5d957d9ff359c40039add23c",
   *          "token_uri":"one",
   *          "token_id":"0x119eda3adb1dab00000000000000000000000000000000000000000000000000",
   *          "salt":"0x207091ec5be2346fad6a402cf41ea24d0959561fa2502a75e93b05",
   *          "token_commitment":"0x6e139af509abe69a2f642e12317bd6fcb049694e5f3859bda03945",
   *          "token_commitment_index":0,
   *          "is_minted":true,
   *          "created_at":"2019-10-03T04:48:31.223Z",
   *          "updated_at":"2019-10-03T04:48:31.223Z",
   *        }
   *      ],
   *      "totalCount":1
   *      }
   *    }
   */
  .get(getNFTCommitments);

/**
 * @api {get} /token/transactions fetch ERC-721 commitment transactions from database
 * @apiVersion 1.0.0
 * @apiName  List all ERC-721 commitment transactions
 * @apiGroup ERC-721 commitment
 *
 * @apiParam (Request query) {String} limit page size (optional).
 * @apiParam (Request query) {String} pageNo page number (optional).

 *
 * @apiExample {js} Example usage:
 * const qyery = {
 *    limit: '12',
 *    pageNo: 2
 * }
 *
 * $http.post(url, data)
 *   .success((res, status) => doSomethingHere())
 *   .error((err, status) => doSomethingHere());
 *
 * @apiSuccess (Success 200) {Array} data ERC-721 commitment transactions.
 * @apiSuccess (Success 200) {Array} totalCount Total no. of token transactions.
 *
 * @apiSuccessExample {json} Success response:
 *     HTTPS 200 OK
 *    {
 *      "data":[
 *        {
 *          "_id":"5d957d9ff359c40039add23c",
 *          "token_uri":"one",
 *          "token_id":"0x119eda3adb1dab00000000000000000000000000000000000000000000000000",
 *          "salt":"0x207091ec5be2346fad6a402cf41ea24d0959561fa2502a75e93b05",
 *          "token_commitment":"0x6e139af509abe69a2f642e12317bd6fcb049694e5f3859bda03945",
 *          "token_commitment_index":0,
 *          "type":"minted",
 *          "created_at":"2019-10-03T04:48:31.223Z",
 *          "updated_at":"2019-10-03T04:48:31.223Z",
 *        }
 *      ],
 *      "totalCount":1
 *      }
 *    }
 */
router.route('/transactions').get(getNFTCommitmentTransactions);

export default router;
