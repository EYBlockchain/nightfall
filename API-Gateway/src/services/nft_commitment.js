import { whisperTransaction } from './whisper';

const zkp = require('../rest/zkp');
const db = require('../rest/db');
const Response = require('../routes/response/response');
const accounts = require('../rest/accounts');
const offchain = require('../rest/offchain');

// check correctness
export async function checkCorrectnessToken(req, res, next) {
  const response = new Response();

  try {
    const { data } = await zkp.checkCorrectnessToken(req.headers, req.body);

    response.statusCode = 200;
    response.data = data;
    res.json(response);
  } catch (err) {
    response.statusCode = 500;
    response.data = err;
    res.status(500).json(response);
    next(err);
  }
}

/**
	 * This function will mint a token and add a transaction in db
	 * req.user {
			address: '0x04b95c76d5075620a655b707a7901462aea8656d',
		 	name: 'alice',
		 	pk_A: '0x4c45963a12f0dfa530285fde66ac235c8f8ddf8d178098cdb292ac',
		 	password: 'alicesPassword'
	 }
	 * req.body {
		 	S_A: '0xE9A313C89C449AF6E630C25AB3ACC0FC3BAB821638E0D55599B518',
		 	uri: 'unique token name',
		 	tokenID: '0x1448d8ab4e0d610000000000000000000000000000000000000000000000000'
		}
	 * @param {*} req
	 * @param {*} res
	 */
export async function mintToken(req, res, next) {
  const response = new Response();
  try {
    // mint a private 'token commitment' within the shield contract to represent the public NFToken with the specified tokenID
    const { data } = await zkp.mintToken(req.user, {
      A: req.body.tokenID,
      pk_A: req.user.pk_A,
    });

    // add the new token commitment (and details of its hash preimage) to the token db.
    await db.addToken(req.user, {
      tokenId: req.body.tokenID,
      tokenUri: req.body.uri,
      salt: data.S_A,
      commitment: data.z_A,
      commitmentIndex: parseInt(data.z_A_index, 16),
      isMinted: true,
    });

    // update public_token db: set is_shielded to 'true' to indicate that the token is 'in escrow' in the shield contract.
    await db.updateNFToken(req.user, {
      uri: req.body.uri,
      tokenId: req.body.tokenID,
      shieldContractAddress: req.body.contractAddress,
      isShielded: true,
    });

    response.statusCode = 200;
    response.data = data;
    res.json(response);
  } catch (err) {
    response.statusCode = 500;
    response.data = err;
    res.status(500).json(response);
    next(err);
  }
}

/**
     * This function will transfer a token and update db
     * req.user {
         address: '0x04b95c76d5075620a655b707a7901462aea8656d',
        name: 'alice',
        pk_A: '0x4c45963a12f0dfa530285fde66ac235c8f8ddf8d178098cdb292ac',
        password: 'alicesPassword'
      }
     * req.body {
        A: '0x1448d8ab4e0d610000000000000000000000000000000000000000000000000',
        uri: 'unique token name',
        S_A: '0xe9a313c89c449af6e630c25ab3acc0fc3bab821638e0d55599b518',
        S_B: '0xF4C7028D78D140333A36381540E70E6210895A994429FB0483FB91',
        sk_A: '0xcf6267b9393a8187ab72bf095e9ffc34af1a5d3d069b9d26e21eac',
        z_A: '0xca2c0c099289896be4d72c74f801bed6e4b2cd5297bfcf29325484',
        receiver_name: 'bob',
        z_A_index: 0,
        pk_B: '0xebbabcc471780d9581451e1b2f03bb54638800dd441d1e5c2344f8'
      }
     * @param {*} req
     * @param {*} res
     */
export async function transferToken(req, res, next) {
  const response = new Response();
  try {
    // Generate a new one-time-use Ethereum address for the transferor to use
    const password = (req.user.address + Date.now()).toString();
    const address = (await accounts.createAccount(password)).data;
    await db.updateUserWithPrivateAccount(req.user, { address, password });
    await accounts.unlockAccount({ address, password });

    // Fetch the transferee's pk from the PKD by passing their username
    const { pk } = await offchain.getZkpPublicKeyFromName(req.body.receiver_name);
    req.body.pk_B = pk;

    // Transfer the token under zero-knowledge:
    // Nullify the transferor's 'token commitment' within the shield contract.
    // Add a new token commitment to the shield contract to represent that the token is now owned by the transferee.
    const { data } = await zkp.spendToken({ address }, req.body);

    // Update the transferor's token db.
    await db.updateToken(req.user, {
      tokenId: req.body.A,
      tokenUri: req.body.uri,
      salt: req.body.S_A,
      commitment: req.body.z_A,
      commitmentIndex: req.body.z_A_index,
      transferredSalt: data.S_B,
      transferredCommitment: data.z_B,
      transferredCommitmentIndex: parseInt(data.z_B_index, 16),
      transferee: req.body.receiver_name,
      isTransferred: true,
    });

    // Send details of the newly-created token commitment to Bob (the transferee) via Whisper.
    await whisperTransaction(req, {
      tokenUri: req.body.uri,
      tokenId: req.body.A,
      salt: data.S_B,
      commitment: data.z_B,
      commitmentIndex: parseInt(data.z_B_index, 16),
      transferee: req.body.receiver_name,
      transfereePublicKey: req.body.pk_B,
      for: 'token',
    });

    response.statusCode = 200;
    response.data = data;
    res.json(response);
  } catch (err) {
    response.statusCode = 500;
    response.data = err;
    res.status(500).json(response);
    next(err);
  }
}

/**
     * This function will burn a token and update db's
     * req.user {
         address: '0x7d6ca0d3d9246686626dd5b59f5bbd323cbcb15b',
        name: 'bob',
        pk_A: '0xebbabcc471780d9581451e1b2f03bb54638800dd441d1e5c2344f8',
        password: 'bobsPassword'
      }
     * req.body {
         A: '0x1448d8ab4e0d610000000000000000000000000000000000000000000000000',
          uri: 'unique token name',
          S_A: '0xf4c7028d78d140333a36381540e70e6210895a994429fb0483fb91',
          z_A: '0xe0e327cee19c16949a829977a1e3a36b92c2ef22b735b6d7af6c33',
          Sk_A: '0x99ba1bd95aef4bab8c4f8f73ccc804913c58828f6e11ed4760b2cd',
          z_A_index: 1,
          payTo: 'bob',
      }
     * @param {*} req
     * @param {*} res
     */
export async function burnToken(req, res, next) {
  const response = new Response();
  try {
    const payToAddress = (await offchain.getAddressFromName(req.body.payTo || req.user.name))
      .address;
    // Release the public token from escrow:
    // Nullify the burnor's 'token commitment' within the shield contract.
    // Transfer the public token from the shield contract to the owner.
    await zkp.burnToken(req.user, {
      A: req.body.A,
      S_A: req.body.S_A,
      Sk_A: req.body.Sk_A,
      z_A: req.body.z_A,
      z_A_index: req.body.z_A_index,
      payTo: payToAddress,
    });

    await db.updateToken(req.user, {
      tokenId: req.body.A,
      tokenUri: req.body.uri,
      salt: req.body.S_A,
      commitment: req.body.z_A,
      commitmentIndex: req.body.z_A_index,
      transferee: req.body.payTo || req.user.name,
      isBurned: true,
    });

    const user = await db.getNFToken(req.user, req.body.A);

    if (req.body.payTo) {
      // Send details of the token to the transferee via Whisper
      await whisperTransaction(req, {
        uri: req.body.uri,
        tokenId: req.body.A,
        shieldContractAddress: user.shield_contract_address,
        transferee: req.body.payTo, // this will change when payTo will be a user other than burner himself.
        transferor: req.user.name,
        transferorAddress: req.user.address,
        for: 'NFTToken',
      });
    } else {
      await db.addNFToken(req.user, {
        uri: req.body.uri,
        tokenId: req.body.A,
        shieldContractAddress: user.shield_contract_address,
        transferor: req.user.name,
        transferorAddress: req.user.address,
        isReceived: true,
      });
    }

    response.statusCode = 200;
    response.data = { message: 'burn successful' };
    res.json(response);
  } catch (err) {
    response.statusCode = 500;
    response.data = err;
    res.status(500).json(response);
    next(err);
  }
}
