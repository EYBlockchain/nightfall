import express from 'express';
import { mintNFToken, transferNFToken, burnNFToken, getNFTokens } from '../services/nft';

const router = express.Router();

/**
 * @api {post} /nft/mint Mint a ERC-721 token
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
router.route('/mint').post(mintNFToken);

/**
 * @api {post} /nft/transfer Transfer a ERC-721 token
 * @apiVersion 1.0.0
 * @apiName  Transfer a non-fungible token
 * @apiGroup ERC-721
 *
 * @apiParam (Request body) {String} tokenID unique ERC-721 token Id.
 * @apiParam (Request body) {String} tokenURI URI of token.
 * @apiParam (Request body) {String} receiver_name Name of Transferee.
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
router.route('/transfer').post(transferNFToken);

/**
 * @api {post} /nft/burn Burn a ERC-721 token
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
router.route('/burn').post(burnNFToken);

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
 *	  {
 *		"data":[
 *			{
 *				"is_shielded":false,
 *				"_id":"5ce25daa09416cc13c79b9f0",
 *				"uri":"one",
 *				"token_id":"0x57880c3b9cee300000000000000000000000000000000000000000000000000",
 *				"is_minted":true,
 *				"created_at":"2019-05-20T07:56:26.579Z",
 *				"updated_at":"2019-05-20T07:56:26.579Z",
 *				"__v":0
 *			}
 *		],
 *		"totalCount":1
 *	  }
 */
router.route('/').get(getNFTokens);

export default router;
