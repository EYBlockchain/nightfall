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
 * @apiParam (Request body) {String} tokenUri URI of token.
 *
 * @apiExample {js} Example usage:
 * const data = {
 *   tokenUri: 'unique token URI'
 * }
 *
 * $http.post(url, data)
 *   .success((res, status) => doSomethingHere())
 *   .error((err, status) => doSomethingHere());
 *
 * @apiSuccess (Success 200) {String} message status message.
 *
 * @apiSuccessExample {json} Success response:
 *  HTTPS 200 OK
 *  data: {
 *     "message":"NFT Mint Successful",
 *     "tokenId":"0x1542f342b6220000000000000000000000000000000000000000000000000000"
 *  }
 */
router.route('/mintNFToken').post(mintNFToken);

/**
 * @api {post} /transferNFToken Transfer a ERC-721 token
 * @apiVersion 1.0.0
 * @apiName  Transfer a non-fungible token
 * @apiGroup ERC-721
 *
 * @apiParam (Request body) {String} tokenId unique ERC-721 token Id.
 * @apiParam (Request body) {String} tokenUri URI of token.
 * @apiParam (Request body) {String} receiver Name of Receiver.
 * @apiParam (Request body) {String} contractAddress TokenShield Address (optional).
 *
 * @apiExample {js} Example usage:
 * const data = {
 *    tokenUri: "sample"
 *    tokenId: "0x1542f342b6220000000000000000000000000000000000000000000000000000"
 *    isMinted: true
 *    receiver: {
 *      name: "bob"
 *    }
 * }
 * $http.post(url, data)
 *   .success((res, status) => doSomethingHere())
 *   .error((err, status) => doSomethingHere());
 *
 * @apiSuccess (Success 200) {String} message status message.
 *
 * @apiSuccessExample {json} Success response:
 *  HTTPS 200 OK
 *  "data":{
 *      "message":"NFT Transfer Successful"
 *  }
 */
router.route('/transferNFToken').post(transferNFToken);

/**
 * @api {post} /burnNFToken Burn a ERC-721 token
 * @apiVersion 1.0.0
 * @apiName  Burn a non-fungible token
 * @apiGroup ERC-721
 *
 * @apiParam (Request body) {String} tokenId unique ERC-721 token Id.
 * @apiParam (Request body) {String} tokenUri URI of token.
 * @apiParam (Request body) {String} contractAddress TokenShield Address (optional).
 *
 * @apiExample {js} Example usage:
 * const data = {
 *  receiver: {
 *    name: "bob",
 *    address: "0x666fA6a40F7bc990De774857eCf35e3C82f07505"
 *  }
 *  sender: {
 *    address: "0x6baec85121ad0bd700c197668b2c30030e1ea0df",
 *    name: "alice"
 *  }
 *  _id: "5e26d1983754de00388a57e0"
 *  tokenUri: "sample"
 *  tokenId: "0x1542f342b6220000000000000000000000000000000000000000000000000000"
 *  isReceived: true
 * }
 *
 * $http.post(url, data)
 *   .success((res, status) => doSomethingHere())
 *   .error((err, status) => doSomethingHere());
 *
 * @apiSuccess (Success 200) {String} message status message.
 *
 * @apiSuccessExample {json} Success response:
 * HTTPS 200 OK
 *	  {
 *		"message":"NFT Burn Successful"
 *	  }
 */
router.route('/burnNFToken').post(burnNFToken);

/**
 * @api {get} /getNFTokens List ERC-721 tokens
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
 * HTTPS 200 OK
 *    {
 *      "data":[{
 *          "tokenUri":"sample",
 *          "tokenId":"0x37b95da113e20000000000000000000000000000000000000000000000000000",
 *          "isMinted":true,
 *       }]
 *    }
 */
router.get('/getNFTokens', getNFTokens);

/**
 * @api {post} /insertNFTToDb insert ERC-721 token in database
 * @apiVersion 1.0.0
 * @apiName  insert non-fungible tokens
 * @apiGroup ERC-721
 *
 * @apiParam (Request body) {String} tokenUri
 * @apiParam (Request body) {String} tokenId
 * @apiParam (Request body) {String} shieldContractAddress
 * @apiParam (Request body) {String} sender
 * @apiParam (Request body) {String} senderAddress

 *
 * @apiExample {js} Example usage:
 * const body = {
 *    tokenUri: 'unique token URI',
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
 * HTTPS 200 OK
 *    {
 *      message: 'inserted',
 *    }
 */
router.post('/insertNFTToDb', insertNFTToDb);

/**
 * @api {get} /getNFTTransactions fetch ERC-721 token transactions from database
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
 * HTTPS 200 OK
 *    {
 *      "data":[{
 *          "tokenUri":"sample",
 *          "tokenId":"0x1542f342b6220000000000000000000000000000000000000000000000000000",
 *          "transactionType":"mint",
 *          }],
 *      "totalCount":1
 *      }
 *    }
 */
router.route('/getNFTTransactions').get(getNFTTransactions);

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
 * HTTPS 200 OK
 *	  {
 *		"data":[
 *        {
 *         "address": "0x3915e408fd5cff354fd73549d31a4bc66f7335db59bc4e84001473"
 *        }
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
 * HTTPS 200 OK
 *  {
 *		"data":[
 *        {
 *          balance,
 *          nftName,
 *          nftSymbol,
 *        }
 *		]
 *	}
 */
router.route('/getNFTokenInfo').get(getNFTokenInfo);

export default router;
