import express from 'express';
import {
  mintFToken,
  transferFToken,
  burnFToken,
  getFTokenAddress,
  getFTokenInfo,
  insertFTTransactionToDb,
  getFTTransactions,
} from '../services/ft';

const router = express.Router();

/**
 * @api {post} /mintFToken Mint a ERC-20 token
 * @apiVersion 1.0.0
 * @apiName Mint fungible token
 * @apiGroup ERC-20
 *
 * @apiParam (Request body) {String} amount The amount of ERC-20 token.
 *
 * @apiExample {js} Example usage:
 * const data = {
 *   "amount": 1000
 * }
 *
 * $http.post(url, data)
 *   .success((res, status) => doSomethingHere())
 *   .error((err, status) => doSomethingHere());
 *
 * @apiSuccess (Success 200) {String} message Mint Successful.
 *
 * @apiSuccessExample {json} Success response:
 *     HTTPS 200 OK
 *	  {
 *		"message": "Mint Successful"
 *	  }
 */
router.route('/mintFToken').post(mintFToken);

/**
 * @api {post} /transferFToken Transfer a ERC-20 token
 * @apiVersion 1.0.0
 * @apiName  Transfer fungible token
 * @apiGroup ERC-20
 *
 * @apiParam (Request body) {String} amount The amount of ERC-20 token.
 * @apiParam (Request body) {String} receiver_name The name of the Receiver.
 *
 * @apiExample {js} Example usage:
 * const data = {
 *   "amount": 20,
 *   "receiver_name": "Bob"
 * }
 *
 * $http.post(url, data)
 *   .success((res, status) => doSomethingHere())
 *   .error((err, status) => doSomethingHere());
 *
 * @apiSuccess (Success 200) {String} message transfer Successful.
 *
 * @apiSuccessExample {json} Success response:
 *     HTTPS 200 OK
 *	  {
 *		"message": "transfer Successful"
 *	  }
 */
router.route('/transferFToken').post(transferFToken);

/**
 * @api {post} /burnFToken Burn a ERC-20 token
 * @apiVersion 1.0.0
 * @apiName  Burn fungible token
 * @apiGroup ERC-20
 *
 * @apiParam (Request body) {String} amount The amount of ERC-20 token.
 *
 * @apiExample {js} Example usage:
 * const data = {
 *   "amount": 10
 * }
 *
 * $http.post(url, data)
 *   .success((res, status) => doSomethingHere())
 *   .error((err, status) => doSomethingHere());
 *
 * @apiSuccess (Success 200) {String} message Burn Successful.
 *
 * @apiSuccessExample {json} Success response:
 *     HTTPS 200 OK
 *	  {
 *		"message": "Burn Successful"
 *	  }
 */
router.route('/burnFToken').post(burnFToken);

/**
 * @api {get} /getFTokenContractAddress Retrieve fungible token
 * address from the shield contract which is set by the user
 * @apiVersion 1.0.0
 * @apiName  Retrieve fungible token address
 * @apiGroup ERC-20
 *
 * $http.get(url, data)
 *   .success((res, status) => doSomethingHere())
 *   .error((err, status) => doSomethingHere());
 *
 * @apiSuccess (Success 200) address of ERC-20 tokens.
 *
 * @apiSuccessExample {json} Success response:
 *  HTTPS 200 OK
 *	 {
 *	   "data":
 *        {
 *          "address": "0x3915e408fd5cff354fd73549d31a4bc66f7335db59bc4e84001473"
 *        }
 *	 }
 */
router.route('/getFTokenContractAddress').get(getFTokenAddress);

/**
 * @api {get} /getFTokenInfo Retrieve fungible token address
 * @apiVersion 1.0.0
 * @apiName  Retrieve fungible token address
 * @apiGroup ERC-20
 *
 * $http.get(url, data)
 *   .success((res, status) => doSomethingHere())
 *   .error((err, status) => doSomethingHere());
 *
 * @apiSuccess (Success 200) address of ERC-20 tokens.
 *
 * @apiSuccessExample {json} Success response:
 *  HTTPS 200 OK
 *	 {
 *	   "data":
 *        {
 *          "balance": 0,
 *          "symbol" : 0,
 *          "name" : "samplecoin",
 *        }
 *	 }
 */
router.route('/getFTokenInfo').get(getFTokenInfo);

router
  .route('/transactions')
  /**
   * @api {post} /ft/transactions Insert ERC-20 token transaction in database
   * @apiVersion 1.0.0
   * @apiName  insert fungible token transaction
   * @apiGroup ERC-20
   *
   * @apiParam (Request body) {String} amount The amount of ERC-20 token.
   * @apiParam (Request body) {String} shieldContractAddress current user slected shield contract address.
   * @apiParam (Request body) {String} receiver receiver name.
   * @apiParam (Request body) {String} receiverAddress.
   * @apiParam (Request body) {String} sender.
   * @apiParam (Request body) {String} senderAddress.
   *
   * @apiExample {js} Example usage:
   * const data = {
   *   "amount": 10,
   *   "shieldContractAddress": "0x033..",
   *   "receiver": "BOB",
   *   "receiverAddress": "0xb0b",
   *   "sender": "ALICE",
   *   "senderAddress": "0xA71CE"
   * }
   *
   * $http.post(url, data)
   *   .success((res, status) => doSomethingHere())
   *   .error((err, status) => doSomethingHere());
   *
   * @apiSuccess (Success 200) {String} message insert status message.
   *
   * @apiSuccessExample {json} Success response:
   *     HTTPS 200 OK
   *    {
   *    "message": "inserted"
   *    }
   */
  .post(insertFTTransactionToDb)
  /**
   * @api {get} /ft/transactions fetch ERC-20 token transaction from database
   * @apiVersion 1.0.0
   * @apiName  list fungible token transactions
   * @apiGroup ERC-20
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
   * @apiSuccess (Success 200) {Array} data ERC-20 token transactions.
   * @apiSuccess (Success 200) {Array} totalCount Total no. of tokens.
   *
   *
   * @apiSuccessExample {json} Success response:
   *     HTTPS 200 OK
   *    {
   *      "data":[
   *        {
   *          "_id":"5d95825ff359c40039add23f",
   *          "amount":"1000",
   *          "type":"minted",
   *          "created_at":"2019-10-03T05:08:47.675Z",
   *          "updated_at":"2019-10-03T05:08:47.675Z",
   *        }
   *      ],
   *      "totalCount":1
   *      }
   *    }
   */
  .get(getFTTransactions);

export default router;
