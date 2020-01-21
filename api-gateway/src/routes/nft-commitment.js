import express from 'express';
import {
  checkCorrectnessForNFTCommitment,
  mintToken,
  transferToken,
  burnToken,
  insertNFTCommitmentToDb,
  getNFTCommitmentTransactions,
  getNFTCommitments,
} from '../services/nft-commitment';

const router = express.Router();

router.route('/checkCorrectnessForNFTCommitment').post(checkCorrectnessForNFTCommitment);

/**
 * @api {post} /mintNFTCommitment Mint a ERC-721 commitment
 * @apiVersion 1.0.0
 * @apiName  Mint a ERC-721 commitment
 * @apiGroup ERC-721 commitment
 *
 * @apiParam (Request body) {String} tokenUri URI of token.
 * @apiParam (Request body) {String} tokenId unique ERC-721 token Id.
 * @apiParam (Request body) {String} salt Random generated Salt.
 *
 * @apiExample {js} Example usage:
 * const data = {
 *    outputCommitments: [{
 *      tokenUri: 'unique token name',
 *      tokenId: '0x1448d8ab4e0d610000000000000000000000000000000000000000000000000'
 *    }]
 * }
 *
 * $http.post(url, data)
 *   .success((res, status) => doSomethingHere())
 *   .error((err, status) => doSomethingHere());
 *
 * @apiSuccess (Success 200) {String} commitment Token commitment number.
 * @apiSuccess (Success 200) {Number} commitmentIndex token index value from blockchain.
 *
 * @apiSuccessExample {json} Success response:
 *     HTTPS 200 OK
 *	  {
 *		"commitment":"0x5b531cd1a758cf33affd093fcdb3864bfa72f7717f593a8d7d0118",
 *		"commitmentIndex":"0"
 *	  }
 */
router.route('/mintNFTCommitment').post(mintToken);

/**
 * @api {post} /transferNFTCommitment Transfer a ERC-721 commitment
 * @apiVersion 1.0.0
 * @apiName  Transfer a ERC-721 commitment
 * @apiGroup ERC-721 commitment
 *
 * @apiParam (Request body) {Object} inputCommitments selected commitments.
 * @apiParam (Request body) {Object} outputCommitments Hex String of value.
 * @apiParam (Request body) {Object} receiver Object with Receiver name.
 *
 * @apiExample {js} Example usage:
 * const data = {
 *  inputCommitments: [{
 *    owner: {
 *      name: "alice",
 *      publicKey: "0xd1a1fc7064b0c0d4a071d295734d4210b63bd1396efd47d074ea5ac3b1ec98fb"
 *    }
 *   tokenUri: "sample"
 *   tokenId: "0x37b95da113e20000000000000000000000000000000000000000000000000000"
 *   salt: "0x04a4d4f1bb2053e359c33ae835c180a434ac5fd25858b49098d3eb635fc989c4"
 *   commitment: "0x1f1657d4e05a0e2a7099ff07530bce6a07099cb062b1e70dfe3066c24db691de"
 *   commitmentIndex: 0
 *   isMinted: true
 *  }],
 *  receiver: {
 *    name: "bob"
 *  }
 *
 * $http.post(url, data)
 *   .success((res, status) => doSomethingHere())
 *   .error((err, status) => doSomethingHere());
 *
 * @apiSuccess (Success 200) {String} commitment Token commitment number.
 * @apiSuccess (Success 200) {Number} commitmentIndex token index value from blockchain.
 *
 * @apiSuccessExample {json} Success response:
 *     HTTPS 200 OK
 *	  {
 *		"commitment":"0x5b531cd1a758cf33affd093fcdb3864bfa72f7717f593a8d7d0118",
 *		"commitmentIndex":"1",
 *    "salt": "0xe9a313c89c449af6e630c25ab3acc0fc3bab821638e0d55599b518",
 *    "txReceipt": "0xcf6267b9393a8187ab72bf095e9ffc34af1a5d3d069b9d26e210ac",
 *	  }
 */
router.route('/transferNFTCommitment').post(transferToken);

/**
 * @api {post} /burnNFTCommitment Burn a ERC-721 commitment
 * @apiVersion 1.0.0
 * @apiName  Burn a ERC-721 commitment
 * @apiGroup ERC-721 commitment
 *
 * @apiParam (Request body) {String} tokenId Hex String of a non fungible token to burn.
 * @apiParam (Request body) {String} tokenUri URI of the non fungible token.
 * @apiParam (Request body) {String} salt Salt of the non fungible token.
 * @apiParam (Request body) {String} senderSecretKey Secret key of Transferror (Alice).
 * @apiParam (Request body) {String} commitment Token commitment of the non fungible token.
 * @apiParam (Request body) {String} commitmentIndex Token index of the non fungible token.
 * @apiParam (Request body) {String} reciever Reciever name of the non fungible token.
 *
 * @apiExample {js} Example usage:
 * const data = {
 *    inputCommitments: [
 *    {
 *      tokenId: '0x1448d8ab4e0d610000000000000000000000000000000000000000000000000',
 *      tokenUri: 'unique token name',
 *      salt: '0xe9a313c89c449af6e630c25ab3acc0fc3bab821638e0d55599b518',
 *      senderSecretKey: '0xcf6267b9393a8187ab72bf095e9ffc34af1a5d3d069b9d26e21eac',
 *      commitment: '0xca2c0c099289896be4d72c74f801bed6e4b2cd5297bfcf29325484',
 *      commitmentIndex: 0,
 *      owner: {
 *        name: "bob",
 *        publicKey: "0xbcbcf73fd64ccae777d3324cbfa97ec38599ac412c6fb249abb0c98a23ac2d00"
 *      }
 *    }],
 *   receiver: {
 *      name: 'bob',
 *   },
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
router.route('/burnNFTCommitment').post(burnToken);

/**
 * @api {post} /insertNFTCommitmentToDb Insert ERC-721 commitment in database
 * @apiVersion 1.0.0
 * @apiName  Insert ERC-721 commitment
 * @apiGroup ERC-721 commitment
 *
 * @apiParam (Request body) {String} tokenId Hex String of a non fungible token.
 * @apiParam (Request body) {String} tokenUri URI of the non fungible token.
 * @apiParam (Request body) {String} salt Salt of the non fungible token.
 * @apiParam (Request body) {String} commitment Token commitment of the non fungible token.
 * @apiParam (Request body) {String} commitmentIndex Token index of the non fungible token.
 * @apiParam (Request body) {Boolean} isMinted if data is for minted token.
 * @apiParam (Request body) {Bolean} isReceived if data is transaferred token.
 *
 * @apiExample {js} Example usage:
 * const data = {
 *    tokenId: '0x1448d8ab4e0d610000000000000000000000000000000000000000000000000',
 *    tokenUri: 'unique token name',
 *    salt: '0xe9a313c89c449af6e630c25ab3acc0fc3bab821638e0d55599b518',
 *    commitment: '0xca2c0c099289896be4d72c74f801bed6e4b2cd5297bfcf29325484',
 *    commitmentIndex: 0,
 *    isMinted: true,
 *    isReceived: true
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
router.post('/insertNFTCommitmentToDb', insertNFTCommitmentToDb);

/**
 * @api {get} /getNFTCommitments fetch ERC-721 commitments from database
 * @apiVersion 1.0.0
 * @apiName  List all ERC-721 commitments
 * @apiGroup ERC-721 commitment
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
 * @apiSuccess (Success 200) {Array} data ERC-721 commitments.
 * @apiSuccess (Success 200) {Array} totalCount Total no. of tokens.
 *
 * @apiSuccessExample {json} Success response:
 *     HTTPS 200 OK
 *    {
 *      "data":[
 *        {
 *          "_id":"5d957d9ff359c40039add23c",
 *          "tokenUri":"one",
 *          "tokenId":"0x119eda3adb1dab00000000000000000000000000000000000000000000000000",
 *          "salt":"0x207091ec5be2346fad6a402cf41ea24d0959561fa2502a75e93b05",
 *          "commitment":"0x6e139af509abe69a2f642e12317bd6fcb049694e5f3859bda03945",
 *          "commitmentIndex":0,
 *          "isMinted":true,
 *          "created_at":"2019-10-03T04:48:31.223Z",
 *          "updated_at":"2019-10-03T04:48:31.223Z",
 *        }
 *      ],
 *      "totalCount":1
 *      }
 *    }
 */
router.get('/getNFTCommitments', getNFTCommitments);

/**
 * @api {get} /getNFTCommitmentTransactions fetch ERC-721 commitment transactions from database
 * @apiVersion 1.0.0
 * @apiName  List all ERC-721 commitment transactions
 * @apiGroup ERC-721 commitment
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
 * @apiSuccess (Success 200) {Array} data ERC-721 commitment transactions.
 * @apiSuccess (Success 200) {Array} totalCount Total no. of token transactions.
 *
 * @apiSuccessExample {json} Success response:
 *     HTTPS 200 OK
 *    {
 *      "data":[
 *        {
 *          "_id":"5d957d9ff359c40039add23c",
 *          "token_uri":"one",
 *          "token_id":"0x119eda3adb1dab00000000000000000000000000000000000000000000000000",
 *          "salt":"0x207091ec5be2346fad6a402cf41ea24d0959561fa2502a75e93b05",
 *          "token_commitment":"0x6e139af509abe69a2f642e12317bd6fcb049694e5f3859bda03945",
 *          "token_commitment_index":0,
 *          "type":"minted",
 *          "created_at":"2019-10-03T04:48:31.223Z",
 *          "updated_at":"2019-10-03T04:48:31.223Z",
 *        }
 *      ],
 *      "totalCount":1
 *      }
 *    }
 */
router.route('/getNFTCommitmentTransactions').get(getNFTCommitmentTransactions);

export default router;
