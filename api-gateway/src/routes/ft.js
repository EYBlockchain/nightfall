import express from 'express';
import { mintFToken, transferFToken, burnFToken } from '../services/ft';

const router = express.Router();

/**
 * @api {post} /ft/mint Mint a ERC-20 token
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
router.route('/mint').post(mintFToken);

/**
 * @api {post} /ft/transfer Transfer a ERC-20 token
 * @apiVersion 1.0.0
 * @apiName  Transfer fungible token
 * @apiGroup ERC-20
 *
 * @apiParam (Request body) {String} amount The amount of ERC-20 token.
 * @apiParam (Request body) {String} receiver_name The name of the Transferee.
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
router.route('/transfer').post(transferFToken);

/**
 * @api {post} /ft/burn Burn a ERC-20 token
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
router.route('/burn').post(burnFToken);

export default router;
