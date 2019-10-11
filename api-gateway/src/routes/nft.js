import express from 'express';
import {
  mintNFToken,
  transferNFToken,
  burnNFToken,
  getNFTokens,
  getNFTokenAddress,
  getNFTokenInfo,
  insertNFTToDb,
  getNFTTransactions,
} from '../services/nft';

const router = express.Router();

/**
 * @api {post} /mintNFToken Mint a ERC-721 token
 * @apiVersion 1.0.0
 * @apiName  Mint a non-fungible token
 * @apiGroup ERC-721
 *
 * @apiParam (Request body) {String} tokenURI URI of token.
 *
 * @apiExample {js} Example usage:
 * const data = {
 *   tokenURI: 'unique token URI'
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
 *	  {
 *		"message":"NFT Mint Successful"
 *	  }
 */
router.route('/mintNFToken').post(mintNFToken);

/**
 * @api {post} /transferNFToken Transfer a ERC-721 token
 * @apiVersion 1.0.0
 * @apiName  Transfer a non-fungible token
 * @apiGroup ERC-721
 *
 * @apiParam (Request body) {String} tokenID unique ERC-721 token Id.
 * @apiParam (Request body) {String} tokenURI URI of token.
 * @apiParam (Request body) {String} receiver_name Name of Receiver.
 * @apiParam (Request body) {String} contractAddress TokenShield Address (optional).
 *
 * @apiExample {js} Example usage:
 * const data = {
 *    tokenID: '0xc3b53ccd640c680000000000000000000000000000000000000000000000000',
 *    uri: 'unique token name',
 *    receiver_name: 'bob'.
 *    contractAddress: 'Oxad23..'
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
 *	  {
 *		"message":"NFT Transfer Successful"
 *	  }
 */
router.route('/transferNFToken').post(transferNFToken);

/**
 * @api {post} /burnNFToken Burn a ERC-721 token
 * @apiVersion 1.0.0
 * @apiName  Burn a non-fungible token
 * @apiGroup ERC-721
 *
 * @apiParam (Request body) {String} tokenID unique ERC-721 token Id.
 * @apiParam (Request body) {String} tokenURI URI of token.
 * @apiParam (Request body) {String} contractAddress TokenShield Address (optional).
 *
 * @apiExample {js} Example usage:
 * const data = {
 *    tokenID: '0xc3b53ccd640c680000000000000000000000000000000000000000000000000',
 *    uri: 'unique token name',
 *    contractAddress: 'Oxad23..'
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
 *	  {
 *		"message":"NFT Burn Successful"
 *	  }
 */
router.route('/burnNFToken').post(burnNFToken);

router
  .route('/')
  /**
   * @api {get} /nft List ERC-721 tokens
   * @apiVersion 1.0.0
   * @apiName  List non-fungible tokens
   * @apiGroup ERC-721
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
   * $http.get(url, data)
   *   .success((res, status) => doSomethingHere())
   *   .error((err, status) => doSomethingHere());
   *
   * @apiSuccess (Success 200) {Array} data ERC-721 tokens.
   * @apiSuccess (Success 200) {Array} totalCount Total no. of tokens.
   *
   * @apiSuccessExample {json} Success response:
   *     HTTPS 200 OK
   *    {
   *    "data":[
   *      {
   *        "is_shielded":false,
   *        "_id":"5ce25daa09416cc13c79b9f0",
   *        "uri":"one",
   *        "token_id":"0x57880c3b9cee300000000000000000000000000000000000000000000000000",
   *        "is_minted":true,
   *        "created_at":"2019-05-20T07:56:26.579Z",
   *        "updated_at":"2019-05-20T07:56:26.579Z",
   *        "__v":0
   *      }
   *    ],
   *    "totalCount":1
   *    }
   */
  .get(getNFTokens)

  /**
   * @api {post} /nft insert ERC-721 token in database
   * @apiVersion 1.0.0
   * @apiName  insert non-fungible tokens
   * @apiGroup ERC-721
   *
   * @apiParam (Request body) {String} uri
   * @apiParam (Request body) {String} tokenId
   * @apiParam (Request body) {String} shieldContractAddress
   * @apiParam (Request body) {String} sender
   * @apiParam (Request body) {String} senderAddress

   *
   * @apiExample {js} Example usage:
   * const body = {
   *    uri: 'unique token URI',
   *    tokenId: '0x1448d8ab4e0d610000000000000000000000000000000000000000000000000',
   *    shieldContractAddress: '0x04b95c76d5075620a655b707a7901462aea8656c',
   *    sender: 'a',
   *    senderAddress: '0x04b95c76d5075620a655b707a7901462aea8656d',
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
   *      message: 'inserted',
   *    }
   */
  .post(insertNFTToDb);

/**
 * @api {get} /nft/transactions fetch ERC-721 token transactions from database
 * @apiVersion 1.0.0
 * @apiName  List non-fungible token transactions
 * @apiGroup ERC-721
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
 * @apiSuccess (Success 200) {Array} data ERC-721 token transactions.
 * @apiSuccess (Success 200) {Array} totalCount Total no. of token transactions in database.
 *
 * @apiSuccessExample {json} Success response:
 *     HTTPS 200 OK
 *    {
 *      "data":[
 *        {
 *          "_id":"5d951085f359c40039add23b",
 *          "uri":"one",
 *          "token_id":"0x119eda3adb1dab00000000000000000000000000000000000000000000000000",
 *          "type":"minted",
 *          "created_at":"2019-10-02T21:03:01.491Z",
 *          "updated_at":"2019-10-02T21:03:01.491Z",
 *          "__v":0
 *        }
 *      ],
 *      "totalCount":1
 *      }
 *    }
 */
router.route('/transactions').get(getNFTTransactions);

/**
 * @api {get} /getNFTokenContractAddress Retrieve non-fungible token
 * address from the shield contract which is set by the user
 * @apiVersion 1.0.0
 * @apiName  List non-fungible tokens
 * @apiGroup ERC-721
 *
 * @apiParam (Request query) {String} limit page size (optional).
 * @apiParam (Request query) {String} pageNo page number (optional).
 *
 * @apiExample {js} Example usage:
 *
 * $http.get(url, data)
 *   .success((res, status) => doSomethingHere())
 *   .error((err, status) => doSomethingHere());
 *
 * @apiSuccess (Success 200) {Array} data ERC-721 tokens.
 * @apiSuccess (Success 200) {Array} totalCount Total no. of tokens.
 *
 * @apiSuccessExample {json} Success response:
 *     HTTPS 200 OK
 *	  {
 *		"data":[
 *          {
 *          "address": "0x3915e408fd5cff354fd73549d31a4bc66f7335db59bc4e84001473"
 *          }
 *		]
 *	  }
 */
router.route('/getNFTokenContractAddress').get(getNFTokenAddress);

/**
 * @api {get} /getNFTokenInfo List ERC-721 tokens
 * @apiVersion 1.0.0
 * @apiName  List non-fungible tokens
 * @apiGroup ERC-721
 *
 * @apiParam (Request query) {String} limit page size (optional).
 * @apiParam (Request query) {String} pageNo page number (optional).
 *
 * @apiExample {js} Example usage:
 *
 * $http.get(url, data)
 *   .success((res, status) => doSomethingHere())
 *   .error((err, status) => doSomethingHere());
 *
 * @apiSuccess (Success 200) {Array} data ERC-721 tokens.
 * @apiSuccess (Success 200) {Array} totalCount Total no. of tokens.
 *
 * @apiSuccessExample {json} Success response:
 *     HTTPS 200 OK
 *	  {
 *		"data":[
 *          {
 *              balance,
 *              nftName,
 *              nftSymbol,
 *          }
 *		]
 *	  }
 */
router.route('/getNFTokenInfo').get(getNFTokenInfo);

export default router;
