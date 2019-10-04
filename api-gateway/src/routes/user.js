import express from 'express';
import {
  addContract,
  updateContract,
  deleteContract,
  getAllRegisteredNames,
  getUserDetails,
} from '../services/api-gateway';

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

/**
 * @api {get} /user/getAllRegisteredNames List all registered users
 * @apiVersion 1.0.0
 * @apiName  List non-fungible tokensList all registered users
 * @apiGroup Sheild Contract
 *
 * @apiExample {js} Example usage:
 * const query = {
 *    name : "vishnu.ps"
 * }
 *
 * $http.get(url, data)
 *   .success((res, status) => doSomethingHere())
 *   .error((err, status) => doSomethingHere());
 *
 * @apiSuccess (Success 200) {Array} retrieve all registered users.
 *
 * @apiSuccessExample {json} Success response:
 *     HTTPS 200 OK
 *    {
 *    "data":
 *      {
 *      }
 *    ],
 *    "totalCount":1
 *    }
 */
router.route('/getAllRegisteredNames').get(getAllRegisteredNames);

/**
 * @api {get} /user/getUserDetails fetch user details
 * @apiVersion 1.0.0
 * @apiName  Users information
 * @apiGroup User
 *
 * @apiParam (Request body) {String} coin_shield Address of CoinShield Shield Contract (optional).
 * @apiParam (Request body) {String} token_shield Address of TokenShield Shield Contract (optional).
 *
 *
 * $http.get(url, data)
 *   .success((res, status) => doSomethingHere())
 *   .error((err, status) => doSomethingHere());
 *
 * @apiSuccess (Success 200) {String} message.
 *
 * @apiSuccessExample {json} Success response:
 *     HTTPS 200 OK
 *    {
 *      "_id" : ObjectId("5d950e51f359c40039add239"),
 *      "name" : "a",
 *      "email" : "a",
 *      "address" : "0x47b5b425eb00bb002e77814e3fa0edcc35f02774",
 *      "secretkey" : "0x39c45c2c0117aa7473a112bebe6a5f263ece7cec3d95fc580d6c47",
 *      "publickey" : "0x8a187d107cfaa07492faec946ffde448fe166820865dd6a437b5c4",
 *      "coin_shield_contracts" : [ ],
 *      "token_shield_contracts" : [ ],
 *      "accounts" : [ ],
 *    }
 */
router.get('/getUserDetails', getUserDetails);

export default router;
