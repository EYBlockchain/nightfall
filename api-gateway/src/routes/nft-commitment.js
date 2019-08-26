import express from 'express';
import {
  checkCorrectnessToken,
  mintToken,
  transferToken,
  burnToken,
} from '../services/nft-commitment';

const router = express.Router();

router.route('/checkCorrectness').post(checkCorrectnessToken);

/**
 * @api {post} /token/mint Mint a ERC-721 commitment
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
router.route('/mint').post(mintToken);

/**
 * @api {post} /token/transfer Transfer a ERC-721 commitment
 * @apiVersion 1.0.0
 * @apiName  Transfer a ERC-721 commitment
 * @apiGroup ERC-721 commitment
 *
 * @apiParam (Request body) {String} A Hex String of token.
 * @apiParam (Request body) {String} uri URI of token.
 * @apiParam (Request body) {String} S_A Salt of token A.
 * @apiParam (Request body) {String} S_B Random generated Salt.
 * @apiParam (Request body) {String} sk_A Secret key of Transferror (Alice).
 * @apiParam (Request body) {String} pk_B Public key of Transferee (Bob).
 * @apiParam (Request body) {String} z_A Token commitment of token A.
 * @apiParam (Request body) {String} z_A_index Token index of token A.
 * @apiParam (Request body) {String} receiver_name Transferee name.
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
router.route('/transfer').post(transferToken);

/**
 * @api {post} /token/burn Burn a ERC-721 commitment
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
router.route('/burn').post(burnToken);

export default router;
