import express from 'express';
import {
  mintFToken,
  transferFToken,
  burnFToken,
  getFTokenAddress,
  getFTokenInfo,
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
 * @api {get} /getFTokenShieldContractAddress Retrieve fungible token
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
router.route('/getFTokenShieldContractAddress').get(getFTokenAddress);

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

export default router;
