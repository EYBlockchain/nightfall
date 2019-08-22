import { whisperTransaction } from './whisper';

const zkp = require('../rest/zkp');
const db = require('../rest/db');
const Response = require('../routes/response/response');
const offchain = require('../rest/offchain');

// ERC-20 token
/**
	 * This function will mint a fungible token
	 * req.body { 
			amount : 200 
		}
	 * @param {*} req
	 * @param {*} res
	*/
export async function mintFToken(req, res, next) {
  const response = new Response();

  try {
    await zkp.mintFToken(req.user, {
      amount: req.body.amount,
    });

    const user = await db.fetchUser(req.user);

    await db.addFTTransaction(req.user, {
      amount: req.body.amount,
      shieldContractAddress: user.selected_coin_shield_contract,
      isMinted: true,
    });

    response.statusCode = 200;
    response.data = { message: 'Mint Successful' };
    res.json(response);
  } catch (err) {
    response.statusCode = 500;
    response.data = err;
    res.status(500).json(response);
    next(err);
  }
}

/**
     * This function will transfer fungible token to a transferee
     * req.body { 
        amount : 200,
        receiver_name: "Bob"
       }
     * @param {*} req
     * @param {*} res
    */
export async function transferFToken(req, res, next) {
  const response = new Response();

  try {
    const { address } = await offchain.getAddressFromName(req.body.receiver_name);

    await zkp.transferFToken(req.user, {
      amount: req.body.amount,
      toAddress: address,
    });

    const user = await db.fetchUser(req.user);

    await db.addFTTransaction(req.user, {
      amount: req.body.amount,
      shieldContractAddress: user.selected_coin_shield_contract,
      transferee: req.body.receiver_name,
      transfereeAddress: address,
      isTransferred: true,
    });

    await whisperTransaction(req, {
      amount: req.body.amount,
      shieldContractAddress: user.selected_coin_shield_contract,
      transferee: req.body.receiver_name,
      transferor: req.user.name,
      transferorAddress: req.user.address,
      for: 'FToken',
    }); // send ft token data to BOB side

    response.statusCode = 200;
    response.data = { message: 'transfer Successful' };
    res.json(response);
  } catch (err) {
    response.statusCode = 500;
    response.data = err;
    res.status(500).json(response);
    next(err);
  }
}

/**
     * This function will burn a fungible token.
     * req.body { 
         amount : 200
      }
     * @param {*} req
     * @param {*} res
    */
export async function burnFToken(req, res, next) {
  const response = new Response();

  try {
    await zkp.burnFToken(req.user, {
      amount: req.body.amount,
    });

    const user = await db.fetchUser(req.user);

    await db.addFTTransaction(req.user, {
      amount: req.body.amount,
      shieldContractAddress: user.selected_coin_shield_contract,
      isBurned: true,
    });

    response.statusCode = 200;
    response.data = { message: 'Burn Successful' };
    res.json(response);
  } catch (err) {
    response.statusCode = 500;
    response.data = err;
    res.status(500).json(response);
    next(err);
  }
}
