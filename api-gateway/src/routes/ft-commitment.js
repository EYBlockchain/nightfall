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
  consolidationTransfer,
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
 * @apiSuccess (Success 200) {String} commitment      commitment number.
 * @apiSuccess (Success 200) {Number} commitmentIndex commitment index value from blockchain.
 * @apiSuccess (Success 200) {String} salt genearted  salt to mint commitment.
 *
 * @apiSuccessExample {json} Success response:
 *     HTTPS 200 OK
 *    {
 *    "commitment":"0x70bae19c32ea6e30bf9953c954df271474f86fc9a21589c3422fea314f43f6aa",
 *    "commitmentIndex":0,
 *    "salt":"0xc3b5b05920e17e3afe63efa2d18b3c5b1e2036659f891e69c513adf61a5d42f3"
 *    }
 */
router.route('/mintFTCommitment').post(mintFTCommitment);

/**
 * @api {post} /transferFTCommitment Transfer ERC-20 commitment
 * @apiVersion 1.0.0
 * @apiName  Transfer ERC-20 commitment
 * @apiGroup ERC-20 commitment
 *
 * @apiParam (Request body) {Object} inputCommitments   array of selected commitments.
 * @apiParam (Request body) {Object} outputCommitments  array of Hex String of value.
 * @apiParam (Request body) {Object} receiver           object with key name of receiver.
 *
 * @apiExample {js} Example usage:
 * const data = {
 *  inputCommitments: [
 *  {
 *      owner:{
 *        name: "alice"
 *        publicKey: "0x3960975fbb1bf5469c8ec68ec9a77a80eeb64656624512d53f48ce9c3127d2f0"
 *      }
 *      value: "0x0000000000000000000000000000000a"
 *      salt: "0xc3b5b05920e17e3afe63efa2d18b3c5b1e2036659f891e69c513adf61a5d42f3"
 *      commitment: "0x70bae19c32ea6e30bf9953c954df271474f86fc9a21589c3422fea314f43f6aa"
 *      commitmentIndex: 0
 *      isMinted: true
 *  },
 *  {
 *    owner:{
 *      name: "alice"
 *      publicKey: "0x3960975fbb1bf5469c8ec68ec9a77a80eeb64656624512d53f48ce9c3127d2f0"
 *    }
 *    value: "0x0000000000000000000000000000000f"
 *    salt: "0x50dd62ef0dd2be23a4d4efbf7fe49b21f05445cf574cfdc7f270c54865027dbe"
 *    commitment: "0x6cfd9a8a222ee5794cdacd25bb77fa5034127576503fce7aa208715ec9868dc4"
 *    commitmentIndex: 1
 *    isMinted: true
 *   },
 *  ],
 *  outputCommitments: [
 *  {
 *    value: '0x00000000000000000000000000001770',
 *  },
 *  {
 *    value: '0x00000000000000000000000000002328',
 *   }
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
 * @apiSuccess (Success 200) {Number} value value to be transferred.
 * @apiSuccess (Success 200) {String} salt genearted salt to mint commitment.
 * @apiSuccess (Success 200) {Object} owner Owner object with name and publickey.
 * @apiSuccess (Success 200) {Number} commitmentIndex commitment index value from blockchain.
 * @apiSuccess (Success 200) {String} commitment commitment number.
 * @apiSuccessExample {json} Success response:
 * HTTPS 200 OK
 * {
 * data: [
 * {
 *     "value": "0x00000000000000000000000000000014",
 *     "salt": "0x5e785f9470d92cde5c2c4c0aacf235f58087da8c9264530ea2074e8125dfcfe1",
 *     "commitment": "0x7a6bca440eb1022f0f9e387bea0a648092b94cbaf130c915402ed8ad3c191595",
 *     "commitmentIndex": 2,
 *     "owner":
 *     {
 *         "name": "bob",
 *         "publicKey": "0xf7a4e1ae3290ffa5030c455cfae7f7d49c23c7969a72b5d2013f23ecab22b0e1"
 *    }
 * },
 * {
 *   "value": "0x00000000000000000000000000000005",
 *   "salt": "0x70e1e9ca79f6f3eff36a7e8dbee5758a8250290981f184b0d0b9deafc5ee191c",
 *   "commitment": "0x518ec4e8ac78cfdff5145ba7f6effceaace77d08789282d73e6cd2d521db3557",
 *   "commitmentIndex": 3,
 *   "owner":
 *   {
 *       "address": "0xa2e35bc06bf76fba17210f5b7f59c1b37fe48f66",
 *        "name": "alice",
 *       "publicKey": "0x3960975fbb1bf5469c8ec68ec9a77a80eeb64656624512d53f48ce9c3127d2f0",
 *       "password": ""
 *   }
 * }
 * ]
 * }
 */
router.route('/transferFTCommitment').post(transferFTCommitment);

/**
 * @api {post} /burnFTCommitment Burn a ERC-20 commitment
 * @apiVersion 1.0.0
 * @apiName  Burn a ERC-20 commitment
 * @apiGroup ERC-20 commitment
 *
 * @apiParam (Request body) {String} value Hex String representing the 'amount' of a fungible currency to transact.
 * @apiParam (Request body) {String} publicKey Public key of Burner (Alice).
 * @apiParam (Request body) {String} senderSecretKey Secret key of Burner (Alice).
 * @apiParam (Request body) {String} salt Salt of coin A.
 * @apiParam (Request body) {String} commitmentIndex coin index value of coin A.
 * @apiParam (Request body) {String} commitment Coin Commitment of coin A.
 * @apiParam (Request body) {Object} receiver reciever name.
 *
 * @apiExample {js} Example usage:
 * const data = {
 *  inputCommitments: [
 *  {
 *  "owner":
 *  {
 *    "name": "bob",
 *    "publicKey": "0xf7a4e1ae3290ffa5030c455cfae7f7d49c23c7969a72b5d2013f23ecab22b0e1"
 *  }
 *  value: "0x00000000000000000000000000000005"
 *  salt: "0x70e1e9ca79f6f3eff36a7e8dbee5758a8250290981f184b0d0b9deafc5ee191c"
 *  commitment: "0x518ec4e8ac78cfdff5145ba7f6effceaace77d08789282d73e6cd2d521db3557"
 *  commitmentIndex: 3
 *  }
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
 * HTTPS 200 OK
 * {
 *    "message":"Burn successful",
 * }
 */
router.route('/burnFTCommitment').post(burnFTCommitment);

/**
 * @api {post} /insertFTCommitmentToDb Insert ERC-20 commitment in database
 * @apiVersion 1.0.0
 * @apiName  Insert ERC-20 commitment
 * @apiGroup ERC-20 commitment
 *
 * @apiParam (Request body) {String}  value Hex String representing the 'amount' of a fungible currency to transact.
 * @apiParam (Request body) {String}  salt Salt.
 * @apiParam (Request body) {String}  commitment Token commitment.
 * @apiParam (Request body) {String}  commitmentIndex Token index.
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
 * HTTPS 200 OK
 * {
 *    "message":"inserted"
 * }
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
 * @apiSuccess (Success 200) {Number} value           value to be transferred.
 * @apiSuccess (Success 200) {Array}  totalCount      Total no. of tokens.
 * @apiSuccess (Success 200) {String} salt            genearted salt to mint commitment.
 * @apiSuccess (Success 200) {Object} owner           Owner object with name and publickey.
 * @apiSuccess (Success 200) {Number} commitmentIndex commitment index value from blockchain.
 * @apiSuccess (Success 200) {String} commitment      commitment number.
 *
 * @apiSuccessExample {json} Success response:
 * HTTPS 200 OK
 *    {
 *      "data":[
 *        {
 *          "_id":"5d9583cff359c40039add240",
 *          "value":"0x00000000000000000000000000000002",
 *          "salt":"0xdba2b9fd61a7a5ff60cc6d025777b736aa1bf74e1fdcb90ee34b33",
 *          "commitment":"0x33894fa46908748639356cad7e69a2962316f07a9fb711fc2a2997",
 *          "commitmentIndex":0,
 *          "isMinted":true,
 *          "createdAt":"2019-10-03T05:14:55.570Z",
 *          "updatedAt":"2019-10-03T05:14:55.570Z",
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
 * @apiParam (Request query) {String} limit   page size (optional).
 * @apiParam (Request query) {String} pageNo  page number (optional).

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
 * @apiSuccess (Success 200) {Object} inputCommitments   array of selected commitments.
 * @apiSuccess (Success 200) {Object} outputCommitments  array of Hex String of value.
 * @apiSuccess (Success 200) {Object} receiver           object with key name of receiver.
 * @apiSuccess (Success 200) {Array} transactionType     Transaction type.
 *
 * @apiSuccessExample {json} Success response:
 * HTTPS 200 OK
 *    {
 *      "data":[{
 *        "_id":"5e255a5a415c6b0039a057c7",
 *        "outputCommitments":[
 *        {
 *          "owner":{
 *            "name":"alice",
 *            "publicKey":"0x3960975fbb1bf5469c8ec68ec9a77a80eeb64656624512d53f48ce9c3127d2f0"
 *           },
 *        "_id":"5e255a5a415c6b0039a057c8",
 *        "value":"0x00000000000000000000000000000005",
 *        "commitment":"0xf1528faf7a55ee9367c661c9e1183b742cbf5aff153d6aab589be0c59f50ab59",
 *        "commitmentIndex":4,
 *        "salt":"0xf2e46ea363a2d95723a356acf4a2f3b9c65615ee6049028f0b3990bbacfe0e95"
 *        }],
 *        "transactionType":"mint",
 *        "inputCommitments":[],
 *        },{
 *        "sender":{
 *          "name":"alice",
 *          "publicKey":"0x3960975fbb1bf5469c8ec68ec9a77a80eeb64656624512d53f48ce9c3127d2f0"
 *        },
 *        "receiver":{
 *          "name":"alice"
 *        },
 *      }
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
 *  owner: {
 *    name: "alice"
 *    publicKey: "0x3960975fbb1bf5469c8ec68ec9a77a80eeb64656624512d53f48ce9c3127d2f0"
 *  },
 *  inputCommitments: [{
 *    value: "0x00000000000000000000000000000005"
 *    salt: "0xf2e46ea363a2d95723a356acf4a2f3b9c65615ee6049028f0b3990bbacfe0e95"
 *    commitment: "0xf1528faf7a55ee9367c661c9e1183b742cbf5aff153d6aab589be0c59f50ab59"
 *    commitmentIndex: 4
 *    isMinted: true
 *  }],
 *  outputCommitments: [
 *    {
 *      "value": "0x00000000000000000000000000000002",
 *      "receiver": {
 *          name: "b",
 *      }
 *    },
 *    {
 *      "value": "0x00000000000000000000000000000002",
 *      "receiver": {
 *          name: "a",
 *      }
 *    }
 *  ]
 * }
 *
 * $http.post(url, data)
 *   .success((res, status) => doSomethingHere())
 *   .error((err, status) => doSomethingHere());
 *
 * @apiSuccess (Success 200) {Number} value           value to be transferred.
 * @apiSuccess (Success 200) {String} salt            genearted salt to mint commitment.
 * @apiSuccess (Success 200) {Object} owner           Owner object with name and publickey.
 * @apiSuccess (Success 200) {Number} commitmentIndex commitment index value from blockchain.
 * @apiSuccess (Success 200) {String} commitment      commitment number.
 * @apiSuccessExample {json} Success response:
 * HTTPS 200 OK
 * data: [
 *    {
 *      "value":"0x00000000000000000000000000000001",
 *      "receiver":
 *       {
 *          "name":"alice",
 *          "publicKey":"0x3960975fbb1bf5469c8ec68ec9a77a80eeb64656624512d53f48ce9c3127d2f0"
 *        },
 *      "salt":"0x35889aa7956840fed7065c96820ec20ca8bf1c3a98a453c74710c1dce44fd0f6",
 *      "commitment":"0xdd673ce343f933092d8deee54be179f67b916567a34f1e476df6a3b767cc7d23",
 *      "commitmentIndex":26,
 *      "owner":
 *      {
 *        "name":"alice",
 *        "publicKey":"0x3960975fbb1bf5469c8ec68ec9a77a80eeb64656624512d53f48ce9c3127d2f0"}
 *      },
 *      {
 *      "value":"0x00000000000000000000000000000002",
 *      "receiver":{
 *          "name":"bob",
 *          "publicKey":"0xf7a4e1ae3290ffa5030c455cfae7f7d49c23c7969a72b5d2013f23ecab22b0e1"
 *       },
 *       "salt":"0xd525f4a31e3fd9cb1d924c70162272699e4482b3d519ab1597999cf1796e230a",
 *       "commitment":"0xdadbc2a90b75b2782c7f3507e4cddd2875460d64f540db0eed536bac413bcfcc",
 *       "commitmentIndex":27,
 *        "owner":{
 *            "name":"charlie",
 *            "publicKey":"0xf7a4e1ae3290ffa5030c455cfae7f7d49c23c7969a72b5d2013f23ecab22b0e1"}
 *       }
 *  ]
 */
router.post('/simpleFTCommitmentBatchTransfer', simpleFTCommitmentBatchTransfer);

/**
 * @api {post} /consolidationTransfer consolidation Transfer for ERC-20 commitment
 * @apiVersion 1.0.0
 * @apiName  Consolidation Transfer ERC-20 commitment
 * @apiGroup ERC-20 commitment
 *
 * @apiParam (Request body) {Object} inputCommitments array of selected commitments.
 * @apiParam (Request body) {Object} outputCommitment array of Hex String of value.
 * @apiParam (Request body) {Object} receiver object with key name of receiver.
 * @apiParam (Request body) {Object} sender object with key name of sender.
 *
 * @apiExample {js} Example usage:
 *
 * const data: {
 *  receiver: {name: "a"},
 *  inputCommitments: [
 *  {
 *    owner: {
 *      name: "a"
 *      publicKey: "0x4dcdd089a4afba3c5f779dd97ec3d95e72c5c0da0cadc427fc9a5641a427698f"
 *    },
 *    _id: "5e8c03a7d9431f0039852781"
 *    value: "0x00000000000000000000000000000001"
 *    salt: "0x9780b5a4d7b6b0a1561d29486de67b5f0b6bef4816d1a330a96b0a67a7b2595e"
 *    commitment: "0xd3d39059076b90db1f26324e5690cd974cf46f6727d3ce9e8adc206508e2abf5"
 *    commitmentIndex: 0
 *    isMinted: true
 *  },
 *  {
 *    owner: {
 *      name: "a"
 *      publicKey: "0x4dcdd089a4afba3c5f779dd97ec3d95e72c5c0da0cadc427fc9a5641a427698f"
 *    },
 *    _id: "5e8c03bed9431f0039852784
 *    value: "0x00000000000000000000000000000001"
 *    salt: "0x59538e9d0b2ebb9da1cedf6713730195b898d369fc74ead3633d2bbc22f605ed"
 *    commitment: "0xb85bf44d9e18820c19f5b1319b0ab24ffbe9ad524a5bb60cb1f438f9f39b18d3"
 *    commitmentIndex: 1
 *    isMinted: true
 *  },
 *  {
 *    owner: {
 *      name: "a"
 *      publicKey: "0x4dcdd089a4afba3c5f779dd97ec3d95e72c5c0da0cadc427fc9a5641a427698f"
 *    },
 *    _id: "5e8c03bed9431f0039852784
 *    value: "0x00000000000000000000000000000001"
 *    salt: "0x2e3d5c27bb97d50b304a34a04451756fc3dca4b38b2c831a16c33aabb9676952"
 *    commitment: "0xc925442eb33a92105b090c42cdfb62893968a2601e425cfdd4f2ee19387c67e9"
 *    commitmentIndex: 2
 *    isMinted: true
 *  },
 *  ...
 * ],
 * }
 *
 * $http.post(url, data)
 *   .success((res, status) => doSomethingHere())
 *   .error((err, status) => doSomethingHere());
 *
 * @apiSuccess (Success 200) {Number} value value to be transferred.
 * @apiSuccess (Success 200) {String} salt genearted salt to mint commitment.
 * @apiSuccess (Success 200) {Object} owner Owner object with name and publickey.
 * @apiSuccess (Success 200) {Number} commitmentIndex commitment index value from blockchain.
 * @apiSuccess (Success 200) {String} commitment commitment number.
 * @apiSuccessExample {json} Success response:
 * HTTPS 200 OK
 * data :
 * {
 *    "value":"0x00000000000000000000000000000014",
 *    "salt":"0xce4f2a50b07c92b0c12fbf738cd8090ca898c5956f2de14f04c7f6ee6a46bdc7",
 *    "commitment":"0xbb51e94ff3a0ef1e6198195b3b412fe0def4d234ff5916ca953d521f84eea613",
 *    "commitmentIndex": 32
 *    "owner":
 *    {
 *        "name": "b",
 *        "publicKey": "0xb30f3e92f24d08a94cee52a0b4703fbdff096856376b66741a30da5538c80271"
 *     }
 *  }
 */
router.post('/consolidationTransfer', consolidationTransfer);

export default router;
