import express from 'express';
import {
  mintFTCommitment,
  transferFTCommitment,
  burnFTCommitment,
  checkCorrectnessForFTCommitment,
  insertFTCommitmentToDb,
  getFTCommitments,
  getFTCommitmentTransactions,
  simpleFTCommitmentBatchTransfer,
} from '../services/ft-commitment';

const router = express.Router();

router.route('/checkCorrectnessForFTCommitment').post(checkCorrectnessForFTCommitment);

/**
 * @api {post} /mintFTCommitment Mint a ERC-20 commitment
 * @apiVersion 1.0.0
 * @apiName  Mint a ERC-20 commitment
 * @apiGroup ERC-20 commitment
 *
 * @apiParam (Request body) {Object} outputCommitments array of Hex String of value.
 *
 * @apiExample {js} Example usage:
 * const data = {
 *    outputCommitments: [{ value: '0x00000000000000000000000000002710' }],
 * }
 *
 * $http.post(url, data)
 *   .success((res, status) => doSomethingHere())
 *   .error((err, status) => doSomethingHere());
 *
 * @apiSuccess (Success 200) {String} commitment commitment number.
 * @apiSuccess (Success 200) {Number} commitmentIndex commitment index value from blockchain.
 * @apiSuccess (Success 200) {String} salt genearted salt to mint commitment.
 *
 * @apiSuccessExample {json} Success response:
 *     HTTPS 200 OK
 *	  {
 *		"commitment":"0x3915e408fd5cff354fd73549d31a4bc66f7335db59bc4e84001473",
 *		"commitmentIndex":"0",
 *    "salt": "0x14de022c9b4a437b346f04646bd7809deb81c38288e9614478351d",
 *	  }
 */
router.route('/mintFTCommitment').post(mintFTCommitment);

/**
 * @api {post} /transferFTCommitment Transfer ERC-20 commitment
 * @apiVersion 1.0.0
 * @apiName  Transfer ERC-20 commitment
 * @apiGroup ERC-20 commitment
 *
 * @apiParam (Request body) {Object} inputCommitments array of selected commitments.
 * @apiParam (Request body) {Object} outputCommitments array of Hex String of value.
 * @apiParam (Request body) {Object} receiver object with key name of receiver.
 *
 * @apiExample {js} Example usage:
 * const data = {
 *  inputCommitments: [
 *    {
 *      value: '0x00000000000000000000000000002710',
 *      salt: '0x14de022c9b4a437b346f04646bd7809deb81c38288e9614478351d',
 *      commitment: '0x39aaa6fe40c2106f49f72c67bc24d377e180baf3fe211c5c90e254',
 *      commitment_index: 0,
 *      owner,
 *    },
 *    {
 *      value: '0x00000000000000000000000000001388',
 *      salt: '0x14de022c9b4a437b346f04646bd7809deb81c38288e9614478351d',
 *      commitment: '0x39aaa6fe40c2106f49f72c67bc24d377e180baf3fe211c5c90e254',
 *      commitment_index: 1,
 *      owner,
 *    },
 *  ],
 *  outputCommitments: [
 *    {
 *      value: '0x00000000000000000000000000001770',
 *    },
 *    {
 *      value: '0x00000000000000000000000000002328',
 *    }
 *  ],
 *  receiver: {
 *    name: 'Bob'
 *  },
 * }
 *
 * $http.post(url, data)
 *   .success((res, status) => doSomethingHere())
 *   .error((err, status) => doSomethingHere());
 *
 *
 * @apiSuccessExample {json} Success response:
 *     HTTPS 200 OK
 *    [
 *     {
 *       "value":"0x00000000000000000000000000000002",
 *       "receiver":{
 *        "name":"b",
 *        "publicKey":"0xea6eabb8e7b17615d841c8ac12dfecd919cad7d40b1cb0be568e00d180350835"
 *       },
 *       "salt":"0xe1c8478eee576a419ebde9df31b9acadc990c1a1d2910394de86a17c6246a901",
 *       "commitment":"0x5e84e824bbaedad48c257f46f7f0fc50936faf848c83895f745a46c996e03dab",
 *       "commitmentIndex":1,
 *       "owner":{
 *        "name":"b",
 *        "publicKey":"0xea6eabb8e7b17615d841c8ac12dfecd919cad7d40b1cb0be568e00d180350835"
 *       }
 *     },
 *     {
 *      "value":"0x00000000000000000000000000000001",
 *      "receiver":{
 *       "name":"a",
 *       "publicKey":"0xa87e22f2053c33656374077f2dec067a4494c75813778dd7459e79d1c5ba8b64"
 *      },
 *      "salt":"0x40fb7ce1b35f3df2e93fb3f7b773e3b3a10bb17f664015e2a6d2e80b23909383",
 *      "commitment":"0x71b6ae5d150dcf22570a0e524d96bc42d3ff44d1d841056f1ce7b33a47f07197",
 *      "commitmentIndex":2,
 *      "owner":{
 *       "name":"a",
 *       "publicKey":"0xa87e22f2053c33656374077f2dec067a4494c75813778dd7459e79d1c5ba8b64"
 *      }
 *    }
 *   ]
 */
router.route('/transferFTCommitment').post(transferFTCommitment);

/**
 * @api {post} /burnFTCommitment Burn a ERC-20 commitment
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
 *  inputCommitments: [
 *    {
 *      value: '0x00000000000000000000000000000001',
 *      salt: '0xa31adb1074f977413fddd3953e333529a3494e110251368cc823fb',
 *      commitment: '0x1ec4a9b406fd3d79a01360ccd14c8530443ea9869f8e9560dafa56',
 *      commitmentIndex: 0,
 *    }
 *  ],
 *  receiver: {
 *    name: 'bob'
 *  }
 * }
 *
 * $http.post(url, data)
 *   .success((res, status) => doSomethingHere())
 *   .error((err, status) => doSomethingHere());
 *
 * @apiSuccess (Success 200) {String} message  Burn success message.
 *
 * @apiSuccessExample {json} Success response:
 *     HTTPS 200 OK
 *	  {
 *		"message":"Burn successful",
 *	  }
 */
router.route('/burnFTCommitment').post(burnFTCommitment);

/**
 * @api {post} /insertFTCommitmentToDb Insert ERC-20 commitment in database
 * @apiVersion 1.0.0
 * @apiName  Insert ERC-20 commitment
 * @apiGroup ERC-20 commitment
 *
 * @apiParam (Request body) {String} amount Hex String.
 * @apiParam (Request body) {String} salt Salt.
 * @apiParam (Request body) {String} commitment Token commitment.
 * @apiParam (Request body) {String} commitmentIndex Token index.
 * @apiParam (Request body) {Boolean} isMinted if data is for minted token.
 *
 * @apiExample {js} Example usage:
 * const data = {
 *    value: '0x00000000000000000000000000000002',
 *    salt: '0xe9a313c89c449af6e630c25ab3acc0fc3bab821638e0d55599b518',
 *    commitment: '0xca2c0c099289896be4d72c74f801bed6e4b2cd5297bfcf29325484',
 *    commitmentIndex: 0,
 *    isMinted: true
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
 *    "message":"inserted"
 *    }
 */
router.post('/insertFTCommitmentToDb', insertFTCommitmentToDb);

/**
 * @api {get} /getFTCommitments fetch ERC-20 commitments from database
 * @apiVersion 1.0.0
 * @apiName  List all ERC-20 commitments
 * @apiGroup ERC-20 commitment
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
 * @apiSuccess (Success 200) {Array} data ERC-20 commitments.
 * @apiSuccess (Success 200) {Array} totalCount Total no. of tokens.
 *
 * @apiSuccessExample {json} Success response:
 *     HTTPS 200 OK
 *    {
 *      "data":[
 *        {
 *          "_id":"5d9583cff359c40039add240",
 *          "ft_commitment_value":"0x00000000000000000000000000000002",
 *          "salt":"0xdba2b9fd61a7a5ff60cc6d025777b736aa1bf74e1fdcb90ee34b33",
 *          "ft_commitment":"0x33894fa46908748639356cad7e69a2962316f07a9fb711fc2a2997",
 *          "ft_commitment_index":0,
 *          "is_minted":true,
 *          "created_at":"2019-10-03T05:14:55.570Z",
 *          "updated_at":"2019-10-03T05:14:55.570Z",
 *        }
 *      ],
 *      "totalCount":1
 *      }
 *    }
 */
router.get('/getFTCommitments', getFTCommitments);

/**
 * @api {get} /getFTCommitmentTransactions fetch ERC-20 commitment transactions from database
 * @apiVersion 1.0.0
 * @apiName  List all ERC-20 commitment transactions
 * @apiGroup ERC-20 commitment
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
 * @apiSuccess (Success 200) {Array} data ERC-20 commitment transactions.
 * @apiSuccess (Success 200) {Array} totalCount Total no. of token transactions.
 *
 * @apiSuccessExample {json} Success response:
 *     HTTPS 200 OK
 *    {
 *      "data":[
 *        {
 *         "_id":"5d9583cff359c40039add241",
 *         "ft_commitment_value":"0x00000000000000000000000000000002",
 *         "salt":"0xdba2b9fd61a7a5ff60cc6d025777b736aa1bf74e1fdcb90ee34b33",
 *         "ft_commitment":"0x33894fa46908748639356cad7e69a2962316f07a9fb711fc2a2997",
 *         "ft_commitment_index":0,
 *         "type":"minted",
 *         "used_ft_commitments":[],
 *         "created_at":"2019-10-03T05:14:55.574Z",
 *         "updated_at":"2019-10-03T05:14:55.574Z",
 *        }
 *      ],
 *      "totalCount":1
 *      }
 *    }
 */
router.route('/getFTCommitmentTransactions').get(getFTCommitmentTransactions);

/**
 * @api {post} /simpleFTCommitmentBatchTransfer Batch Transfer ERC-20 commitment
 * @apiVersion 1.0.0
 * @apiName  Batch Transfer ERC-20 commitment
 * @apiGroup ERC-20 commitment
 *
 * @apiParam (Request body) {Object} inputCommitments array of selected commitments.
 * @apiParam (Request body) {Object} outputCommitments array of Hex String of value.
 * @apiParam (Request body) {Object} receiver object with key name of receiver.
 *
 * @apiExample {js} Example usage:
 * const data = {
 *  inputCommitments: [{
 *    value: "0x00000000000000000000000000000028",
 *    salt: "0x75f9ceee5b886382c4fe81958da985cd812303b875210b9ca2d75378bb9bd801",
 *    commitment: "0x00000000008ec724591fde260927e3fcf85f039de689f4198ee841fcb63b16ed",
 *    commitmentIndex: 1,
 *  }],
 *  outputCommitments: [
 *    {
 *      "value": "0x00000000000000000000000000000002",
 *      "receiver": {
 *        name: "b",
 *      }
 *    },
 *    {
 *      "value": "0x00000000000000000000000000000002",
 *      "receiver": {
 *        name: "a",
 *      }
 *    }
 *  ]
 * }
 *
 * $http.post(url, data)
 *   .success((res, status) => doSomethingHere())
 *   .error((err, status) => doSomethingHere());
 *
 *
 * @apiSuccessExample {json} Success response:
 *     HTTPS 200 OK
 *    [
 *     {
 *       "value":"0x00000000000000000000000000000002",
 *       "receiver":{
 *        "name":"b",
 *        "publicKey":"0xea6eabb8e7b17615d841c8ac12dfecd919cad7d40b1cb0be568e00d180350835"
 *       },
 *       "salt":"0xe1c8478eee576a419ebde9df31b9acadc990c1a1d2910394de86a17c6246a901",
 *       "commitment":"0x5e84e824bbaedad48c257f46f7f0fc50936faf848c83895f745a46c996e03dab",
 *       "commitmentIndex":1,
 *       "owner":{
 *        "name":"b",
 *        "publicKey":"0xea6eabb8e7b17615d841c8ac12dfecd919cad7d40b1cb0be568e00d180350835"
 *       }
 *     },
 *     {
 *      "value":"0x00000000000000000000000000000003",
 *      "receiver":{
 *       "name":"a",
 *       "publicKey":"0xa87e22f2053c33656374077f2dec067a4494c75813778dd7459e79d1c5ba8b64"
 *      },
 *      "salt":"0x40fb7ce1b35f3df2e93fb3f7b773e3b3a10bb17f664015e2a6d2e80b23909383",
 *      "commitment":"0x71b6ae5d150dcf22570a0e524d96bc42d3ff44d1d841056f1ce7b33a47f07197",
 *      "commitmentIndex":2,
 *      "owner":{
 *       "name":"a",
 *       "publicKey":"0xa87e22f2053c33656374077f2dec067a4494c75813778dd7459e79d1c5ba8b64"
 *      }
 *    }
 *   ]
 */
router.post('/simpleFTCommitmentBatchTransfer', simpleFTCommitmentBatchTransfer);

export default router;
