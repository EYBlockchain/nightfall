import { whisperTransaction } from './whisper';
import { db, offchain, zkp } from '../rest';

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

    res.data = { message: 'Mint Successful' };
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * This function will transfer fungible token to a receiver
 * req.body { 
    amount : 200,
    receiver_name: "Bob"
   }
 * @param {*} req
 * @param {*} res
*/
export async function transferFToken(req, res, next) {
  try {
    const receiverAddress = await offchain.getAddressFromName(req.body.receiver_name);

    await zkp.transferFToken(req.user, {
      amount: req.body.amount,
      toAddress: receiverAddress,
    });

    const user = await db.fetchUser(req.user);

    await db.addFTTransaction(req.user, {
      amount: req.body.amount,
      shieldContractAddress: user.selected_coin_shield_contract,
      receiver: req.body.receiver_name,
      receiverAddress,
      isTransferred: true,
    });

    await whisperTransaction(req, {
      amount: req.body.amount,
      shieldContractAddress: user.selected_coin_shield_contract,
      receiver: req.body.receiver_name,
      sender: req.user.name,
      senderAddress: req.user.address,
      for: 'FToken',
    }); // send ft token data to BOB side

    res.data = { message: 'transfer Successful' };
    next();
  } catch (err) {
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

    res.data = { message: 'Burn Successful' };
    next();
  } catch (err) {
    next(err);
  }
}
