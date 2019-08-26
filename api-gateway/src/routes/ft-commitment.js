import express from 'express';
import { mintCoin, transferCoin, burnCoin, checkCorrectnessCoin } from '../services/ft-commitment';

const router = express.Router();

router.route('/checkCorrectness').post(checkCorrectnessCoin);

/**
 * @api {post} /coin/mint Mint a ERC-20 commitment
 * @apiVersion 1.0.0
 * @apiName  Mint a ERC-20 commitment
 * @apiGroup ERC-20 commitment
 *
 * @apiParam (Request body) {String} A Hex String of coins.
 * @apiParam (Request body) {String} pk_A Public key of Minter (Alice).
 * @apiParam (Request body) {String} S_A Random generated Salt.
 *
 * @apiExample {js} Example usage:
 * const data = {
 *    A: '0x00000000000000000000000000002710',
 *    pk_A: '0x70dd53411043c9ff4711ba6b6c779cec028bd43e6f525a25af36b8',
 *    S_A: '0x14DE022C9B4A437B346F04646BD7809DEB81C38288E9614478351D'
 * }
 *
 * $http.post(url, data)
 *   .success((res, status) => doSomethingHere())
 *   .error((err, status) => doSomethingHere());
 *
 * @apiSuccess (Success 200) {String} coin Coin commitment number.
 * @apiSuccess (Success 200) {Number} Coin_index coin index value from blockchain.
 *
 * @apiSuccessExample {json} Success response:
 *     HTTPS 200 OK
 *	  {
 *		"coin":"0x3915e408fd5cff354fd73549d31a4bc66f7335db59bc4e84001473",
 *		"coin_index":"0"
 *	  }
 */
router.route('/mint').post(mintCoin);

/**
 * @api {post} /coin/transfer Transfer ERC-20 commitment
 * @apiVersion 1.0.0
 * @apiName  Transfer ERC-20 commitment
 * @apiGroup ERC-20 commitment
 *
 * @apiParam (Request body) {String} C Hex String value of first slected coin.
 * @apiParam (Request body) {String} D Hex String value of second coin.
 * @apiParam (Request body) {String} E Hex String value to be transferred.
 * @apiParam (Request body) {String} E Hex String value of returned Change.
 * @apiParam (Request body) {String} S_C Salt of coin C.
 * @apiParam (Request body) {String} S_D Salt of coin D.
 * @apiParam (Request body) {String} z_C_index coin index value of coin C.
 * @apiParam (Request body) {String} z_C_index coin index value of coin D.
 * @apiParam (Request body) {String} S_E Salt of coin E (Random generated).
 * @apiParam (Request body) {String} S_F Salt of coin F (Random generated.
 * @apiParam (Request body) {String} sk_A Secret key of Transferror (Alice).
 * @apiParam (Request body) {String} z_C Coin Commitment of coin C.
 * @apiParam (Request body) {String} z_D Coin Commitment of coin D.
 * @apiParam (Request body) {String} pk_A Public key of Transferror (Alice).
 * @apiParam (Request body) {String} receiver_name Name of Transferee.
 * @apiParam (Request body) {String} pk_B Public key of Transferee (Bob).
 *
 * @apiExample {js} Example usage:
 * const data = {
 *    C: '0x00000000000000000000000000002710',
 *    D: '0x00000000000000000000000000001388',
 *    E: '0x00000000000000000000000000001770',
 *    F: '0x00000000000000000000000000002328',
 *    S_C: '0x14de022c9b4a437b346f04646bd7809deb81c38288e9614478351d',
 *    S_D: '0xdd22d29b452a36d4f9fc3b2ad00e9034cc0a4175b52aa35fb7cd92',
 *    z_C_index: 0,
 *    z_D_index: 1,
 *    S_E: '0xEDCE5B0A6607149ECC1293F721924128ABFDCDE553506C792F3DA3',
 *    S_F: '0x4432C08959B75A846A2E50007B5FAC86B18446B910C67B0255BDE7',
 *    sk_A: '0x41ced159d5690ef0ccfe5742783057fc9eb12809af2f16f6f98ffd',
 *    z_C: '0x39aaa6fe40c2106f49f72c67bc24d377e180baf3fe211c5c90e254',
 *    z_D: '0x0ca8040181b3fc505eed1ee6892622054ae877ddf8f9dafe93b072',
 *    pk_A: '0x70dd53411043c9ff4711ba6b6c779cec028bd43e6f525a25af36b8',
 *    receiver_name: 'bob',
 *    pk_B: '0xd68df96f6cddd786290b57fcead37ea670dfe94634f553afeedfef'
 * }
 *
 * $http.post(url, data)
 *   .success((res, status) => doSomethingHere())
 *   .error((err, status) => doSomethingHere());
 *
 * @apiSuccess (Success 200) {String} z_E Coin commitment number.
 * @apiSuccess (Success 200) {Number} z_E_index coin index value from blockchain.
 * @apiSuccess (Success 200) {String} z_F Coin commitment number.
 * @apiSuccess (Success 200) {Number} z_F_index coin index value from blockchain.
 *
 * @apiSuccessExample {json} Success response:
 *     HTTPS 200 OK
 *	  {
 *		"z_E":"0xd24c254ea011b9409670aa95d29b91a421f176e624af6d4441c619",
 *		"z_E_index":"2",
 *		"z_F":"0x4330e0e6eb545771a31fccd6372d4d5d3b8a95f96afd0e9ad0e0b8",
 *		"z_F_index":"3"
 *	  }
 */
router.route('/transfer').post(transferCoin);

/**
 * @api {post} /coin/burn Burn a ERC-20 commitment
 * @apiVersion 1.0.0
 * @apiName  Burn a ERC-20 commitment
 * @apiGroup ERC-20 commitment
 *
 * @apiParam (Request body) {String} A Hex String of coins.
 * @apiParam (Request body) {String} pk_A Public key of Burner (Alice).
 * @apiParam (Request body) {String} sk_A Secret key of Burner (Alice).
 * @apiParam (Request body) {String} S_A Slat of coin A.
 * @apiParam (Request body) {String} z_A_index coin index value of coin A.
 * @apiParam (Request body) {String} z_A Coin Commitment of coin A.
 *
 * @apiExample {js} Example usage:
 * const data = {
 *    A: '0x00000000000000000000000000000001',
 *    sk_A: '0x283ccbfada111a31df7617deeff4d0daaa3f73b05ba100821d17cc',
 *    S_A: '0xa31adb1074f977413fddd3953e333529a3494e110251368cc823fb',
 *    pk_A: '0xf38da818df95339871ef7c6dcabc2fb90344bbf553c4e688323305',
 *    z_A_index: 0,
 *    z_A: '0x1ec4a9b406fd3d79a01360ccd14c8530443ea9869f8e9560dafa56'
 * }
 *
 * $http.post(url, data)
 *   .success((res, status) => doSomethingHere())
 *   .error((err, status) => doSomethingHere());
 *
 * @apiSuccess (Success 200) {String} z_C Coin commitment number.
 * @apiSuccess (Success 200) {Number} z_C_index coin index value from blockchain.
 *
 * @apiSuccessExample {json} Success response:
 *     HTTPS 200 OK
 *	  {
 *		"z_C":"0x3915e408fd5cff354fd73549d31a4bc66f7335db59bc4e84001473",
 *		"z_C_index":3
 *	  }
 */
router.route('/burn').post(burnCoin);

export default router;
