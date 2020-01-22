import { sendWhisperMessage } from './whisper';
import { accounts, db, offchain, zkp } from '../rest';

/**
 * This function will insert NFT commitment in database
 * req.user {
    address: '0x04b95c76d5075620a655b707a7901462aea8656d',
    name: 'alice',
    publicKey: '0x4c45963a12f0dfa530285fde66ac235c8f8ddf8d178098cdb292ac',
    password: 'alicesPassword'
 }
 * req.body {
    tokenUri: 'unique token name'
    tokenId: '0x1448d8ab4e0d610000000000000000000000000000000000000000000000000'
    salt: '0xE9A313C89C449AF6E630C25AB3ACC0FC3BAB821638E0D55599B518',
    commitment: '0xdd3434566',
    commitmentIndex: 1,
    isReceived: true,
  }
 * @param {*} req
 * @param {*} res
 */
export async function insertNFTCommitmentToDb(req, res, next) {
  try {
    res.data = await db.insertNFTCommitment(req.user, req.body);
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * This function will fetch NFT commitments from database
 * req.user {
    address: '0x04b95c76d5075620a655b707a7901462aea8656d',
    name: 'alice',
    publicKey: '0x4c45963a12f0dfa530285fde66ac235c8f8ddf8d178098cdb292ac',
    password: 'alicesPassword'
 }
 * req.query {
    pageNo: 1,
    limit: 4
  }
 * @param {*} req
 * @param {*} res
 */
export async function getNFTCommitments(req, res, next) {
  try {
    res.data = await db.getNFTCommitments(req.user, req.query);
    console.log(res.data);
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * This function will fetch NFT commitment transactions from database
 * req.user {
    address: '0x04b95c76d5075620a655b707a7901462aea8656d',
    name: 'alice',
    publicKey: '0x4c45963a12f0dfa530285fde66ac235c8f8ddf8d178098cdb292ac',
    password: 'alicesPassword'
 }
 * req.query {
    pageNo: 1,
    limit: 4
  }
 * @apiSuccess (Success 200) {Object} data NFT commitment transactions from database.
 * @apiSuccessExample {json} Success response:
 *     HTTPS 200 OK
 * data: {
 * "data":[{
 *    "outputCommitments":[{
 *      "owner":{
 *        "name":"alice",
 *        "publicKey":"0xd1a1fc7064b0c0d4a071d295734d4210b63bd1396efd47d074ea5ac3b1ec98fb"
 *      },
 *      "_id":"5e26d3a43754de00388a57e7",
 *      "tokenUri":"sample",
 *      "tokenId":"0x37b95da113e20000000000000000000000000000000000000000000000000000",
 *      "commitment":"0x1f1657d4e05a0e2a7099ff07530bce6a07099cb062b1e70dfe3066c24db691de",
 *      "commitmentIndex":0,
 *      "salt":"0x04a4d4f1bb2053e359c33ae835c180a434ac5fd25858b49098d3eb635fc989c4"
 *      }
 *    ],
 *  "transactionType":"mint",
 *  "inputCommitments":[],
 *  }],
 *  "totalCount":1
 *  }
 * }
 * @param {*} req
 * @param {*} res
 */
export async function getNFTCommitmentTransactions(req, res, next) {
  try {
    res.data = await db.getNFTCommitmentTransactions(req.user, req.query);
    next();
  } catch (err) {
    next(err);
  }
}

// check correctness
export async function checkCorrectnessForNFTCommitment(req, res, next) {
  try {
    res.data = await zkp.checkCorrectnessForNFTCommitment(req.headers, req.body);
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * This function will mint a token and add a transaction in db
 * req.user {
    address: '0x04b95c76d5075620a655b707a7901462aea8656d',
    name: 'alice',
    publicKey: '0x4c45963a12f0dfa530285fde66ac235c8f8ddf8d178098cdb292ac',
    password: 'alicesPassword'
 }
 * req.body {
    outputCommitments: [{
      shieldContractAddress: '0xE9A313C89C449AF6E630C25AB3ACC0FC3BAB821638E0D55599B518',
      tokenUri: 'unique token name',
      tokenId: '0x1448d8ab4e0d610000000000000000000000000000000000000000000000000'
    }],
  }
 * @param {*} req
 * @param {*} res
 */
export async function mintToken(req, res, next) {
  const {
    outputCommitments: [outputCommitment],
  } = req.body;
  outputCommitment.owner = req.user;
  try {
    // mint a private 'token commitment' within the shield contract to represent the public NFToken with the specified tokenId
    const data = await zkp.mintToken(req.user, outputCommitment);

    data.commitmentIndex = parseInt(data.commitmentIndex, 16);

    // add the new token commitment (and details of its hash preimage) to the token db.
    await db.insertNFTCommitment(req.user, {
      outputCommitments: [
        {
          ...outputCommitment,
          ...data,
        },
      ],
      isMinted: true,
    });

    // update public_token db: set is_shielded to 'true' to indicate that the token is 'in escrow' in the shield contract.
    await db.updateNFTokenByTokenId(req.user, outputCommitment.tokenId, {
      ...outputCommitment,
      isShielded: true,
    });

    res.data = data;
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * This function will transfer a token and update db
 * req.user {
    address: '0x04b95c76d5075620a655b707a7901462aea8656d',
    name: 'alice',
    publicKey: '0x4c45963a12f0dfa530285fde66ac235c8f8ddf8d178098cdb292ac',
    password: 'alicesPassword'
  }
 * req.body {
   inputCommitments: [
     {
      tokenId: '0x1448d8ab4e0d610000000000000000000000000000000000000000000000000',
      tokenUri: 'unique token name',
      salt: '0xe9a313c89c449af6e630c25ab3acc0fc3bab821638e0d55599b518',
      commitment: '0xca2c0c099289896be4d72c74f801bed6e4b2cd5297bfcf29325484',
      commitmentIndex: 0,
     }
   ],
   receiver: {
      name: 'bob',
   }
  }
 * @param {*} req
 * @param {*} res
 */
export async function transferToken(req, res, next) {
  const {
    inputCommitments: [inputCommitment],
    receiver,
  } = req.body;
  try {
    // Generate a new one-time-use Ethereum address for the sender to use
    const password = (req.user.address + Date.now()).toString();
    const address = (await accounts.createAccount(password)).data;
    await db.updateUserWithPrivateAccount(req.user, { address, password });
    await accounts.unlockAccount({ address, password });

    // get logged in user's secretKey.
    const user = await db.fetchUser(req.user);

    // Fetch the receiver's publicKey from the PKD by passing their username
    receiver.publicKey = await offchain.getZkpPublicKeyFromName(receiver.name);

    // Transfer the token under zero-knowledge:
    // Nullify the sender's 'token commitment' within the shield contract.
    // Add a new token commitment to the shield contract to represent that the token is now owned by the receiver.
    const data = await zkp.spendToken(
      { address },
      {
        ...inputCommitment,
        sender: {
          secretKey: user.secretKey,
        },
        receiver,
      },
    );

    data.commitmentIndex = parseInt(data.commitmentIndex, 16);

    // Update the sender's token db.
    await db.updateNFTCommitmentByTokenId(req.user, inputCommitment.tokenId, {
      outputCommitments: [{ owner: receiver }],
      isTransferred: true,
    });

    await db.insertNFTCommitmentTransaction(req.user, {
      inputCommitments: [inputCommitment],
      outputCommitments: [
        {
          ...inputCommitment,
          ...data,
          owner: receiver,
        },
      ],
      receiver,
      sender: req.user,
      isTransferred: true,
    });

    // Send details of the newly-created token commitment to Bob (the receiver) via Whisper.
    await sendWhisperMessage(user.shhIdentity, {
      outputCommitments: [
        {
          ...inputCommitment,
          ...data,
          owner: receiver,
        },
      ],
      blockNumber: data.txReceipt.receipt.blockNumber,
      receiver,
      sender: req.user,
      isReceived: true,
      for: 'NFTCommitment',
    });

    res.data = data;
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * This function will burn a token and update db's
 * req.user {
    address: '0x7d6ca0d3d9246686626dd5b59f5bbd323cbcb15b',
    name: 'bob',
    publicKey: '0xebbabcc471780d9581451e1b2f03bb54638800dd441d1e5c2344f8',
    password: 'bobsPassword'
  }
 * req.body {
   inputCommitments: [
   {
      tokenId: '0x1448d8ab4e0d610000000000000000000000000000000000000000000000000',
      tokenUri: 'unique token name',
      salt: '0xf4c7028d78d140333a36381540e70e6210895a994429fb0483fb91',
      commitment: '0xe0e327cee19c16949a829977a1e3a36b92c2ef22b735b6d7af6c33',
      commitmentIndex: 1,
   }],
   receiver:{
     name: 'bob',
   }, 
  }
 * @param {*} req
 * @param {*} res
 */
export async function burnToken(req, res, next) {
  const {
    receiver,
    inputCommitments: [inputCommitment],
  } = req.body;
  try {
    receiver.address = await offchain.getAddressFromName(receiver.name);

    // get logged in user.
    const user = await db.fetchUser(req.user);
    // Release the public token from escrow:
    // Nullify the burnor's 'token commitment' within the shield contract.
    // Transfer the public token from the shield contract to the owner.
    res.data = await zkp.burnToken(req.user, {
      ...inputCommitment,
      sender: {
        secretKey: user.secretKey,
      },
      receiver,
    });

    await db.updateNFTCommitmentByTokenId(req.user, inputCommitment.tokenId, {
      isBurned: true,
    });

    await db.insertNFTCommitmentTransaction(req.user, {
      inputCommitments: [inputCommitment],
      receiver,
      sender: req.user,
      isBurned: true,
    });

    const { tokenUri, tokenId, shieldContractAddress } = inputCommitment;
    await sendWhisperMessage(user.shhIdentity, {
      tokenUri,
      tokenId,
      shieldContractAddress,
      receiver,
      sender: req.user,
      isReceived: true,
      for: 'NFTToken',
    }); // send nft token data to BOB side

    res.data = { message: 'burn successful' };
    next();
  } catch (err) {
    next(err);
  }
}
