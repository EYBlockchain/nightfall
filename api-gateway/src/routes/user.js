import express from 'express';
import { addContract, updateContract, deleteContract } from '../services/api-gateway';

const router = express.Router();

/**
 * @api {post} /user/contractAddress Add shield contract information
 * @apiVersion 1.0.0
 * @apiName  Add & set shield contract
 * @apiGroup Sheild Contract
 *
 * @apiParam (Request body) {String} contractAddress Address of Shield Contract.
 * @apiParam (Request body) {String} contractName Name of Shield Contract.
 *
 * @apiExample {js} Example usage:
 * const data = {
 *    "contractAddress": "0x674eD18709c896dD74a8CA3378BBF37333faC345",
 *    "contractName": "tokenShield"
 * }
 *
 * $http.post(url, data)
 *   .success((res, status) => doSomethingHere())
 *   .error((err, status) => doSomethingHere());
 *
 * @apiSuccess (Success 200) {String} message {coin/token}.
 *
 * @apiSuccessExample {json} Success response:
 *     HTTPS 200 OK
 *	  {
 *		"message":"Added of type coin"
 *	  }
 */
router.route('/contractAddress').post(addContract);

/**
 * @api {put} /user/contractAddress update shield contract information
 * @apiVersion 1.0.0
 * @apiName  update AND/OR set shield contract
 * @apiGroup Sheild Contract
 *
 * @apiParam (Request body) {Object} tokenShield information to update (optional).
 * @apiParam (Request body) {Object} coinShield information to update (optional).
 *
 * @apiExample {js} Example usage:
 * const data = {
 *		"tokenShield": {
 *			"contractAddress": "0x88B8d386BA803423482f325Be664607AE1Db6E1F",
 *			"contractName": "tokenShield1",
 *			"isSelected": true
 *		},
 *		"coinShield": {
 *			"contractAddress": "0x3BBa2cdBb2376F07017421878540c424aAB61294",
 *			"contractName": "coinShield0",
 *			"isSelected": false
 *		}
 * }
 *
 * $http.put(url, data)
 *   .success((res, status) => doSomethingHere())
 *   .error((err, status) => doSomethingHere());
 *
 * @apiSuccess (Success 200) {String} message.
 *
 * @apiSuccessExample {json} Success response:
 *     HTTPS 200 OK
 *	  {
 *		"message":"Contract Address updated"
 *	  }
 */
router.route('/contractAddress').put(updateContract);

/**
 * @api {delete} /user/contractAddress Add shield contract information
 * @apiVersion 1.0.0
 * @apiName  Add & set shield contract
 * @apiGroup Sheild Contract
 *
 * @apiParam (Request body) {String} coin_shield Address of CoinShield Shield Contract (optional).
 * @apiParam (Request body) {String} token_shield Address of TokenShield Shield Contract (optional).
 *
 * @apiExample {js} Example usage:
 * const query = {
 *    "coin_shield": "0x674eD18709c896dD74a8CA3378BBF37333faC345",
 *    "token_shield": "0x674eD18709c896dD74a8CA3378BBF37333faC345"
 * }
 *
 * $http.delete(url, data)
 *   .success((res, status) => doSomethingHere())
 *   .error((err, status) => doSomethingHere());
 *
 * @apiSuccess (Success 200) {String} message.
 *
 * @apiSuccessExample {json} Success response:
 *     HTTPS 200 OK
 *	  {
 *		"message":"Contract Address Removed"
 *	  }
 */
router.route('/contractAddress').delete(deleteContract);

export default router;
