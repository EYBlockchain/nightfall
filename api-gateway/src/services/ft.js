import { sendWhisperMessage } from './whisper';
import { db, offchain, zkp } from '../rest';

// ERC-20 token
/**
 * This function will insert FT transactions into database
 * req.user {
    address: '0x432038accaf756a8936a7f067a8223c2d929d58f',
    name: 'alice',
    publicKey: '0xd68df96f6cddd786290b57fcead37ea670dfe94634f553afeedfef',
    password: 'alicesPassword'
  }
 * req.body {
    value: 4,
    shieldContractAddress: '0x04b95c76d5075620a655b707a7901462aea8656c',
    sender: {
      name: 'a',
      address: '0x04b95c76d5075620a655b707a7901462aea8656d'
    },
    receiver: {
      name: 'b',
      address: '0x04b95c76d5075620a655b707a7901462aea8656d'
    },
  }
 * @param {*} req
 * @param {*} res
 */
export async function insertFTTransactionToDb(req, res, next) {
  try {
    res.data = await db.insertFTTransaction(req.user, req.body);
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * This function will fetch FT transactions
 * req.user {
    address: '0x432038accaf756a8936a7f067a8223c2d929d58f',
    name: 'alice',
    publicKey: '0xd68df96f6cddd786290b57fcead37ea670dfe94634f553afeedfef',
    password: 'alicesPassword'
  }
 * req.query {
    pageNo: 1,
    limit: 4
  }
 * @param {*} req
 * @param {*} res
 */
export async function getFTTransactions(req, res, next) {
  try {
    res.data = await db.getFTTransactions(req.user, req.query);
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * This function will mint a fungible token
 * req.body { 
    value : 200 
  }
 * @param {*} req
 * @param {*} res
*/
export async function mintFToken(req, res, next) {
  try {
    await zkp.mintFToken(req.user, req.body);

    const user = await db.fetchUser(req.user);

    await db.insertFTTransaction(req.user, {
      value: req.body.value,
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
    value : 200,
    receiver: {
      name: "Bob"
    }
   }
 * @param {*} req
 * @param {*} res
*/
export async function transferFToken(req, res, next) {
  const { receiver, value } = req.body;

  try {
    receiver.address = await offchain.getAddressFromName(receiver.name);

    await zkp.transferFToken(req.user, req.body);

    const user = await db.fetchUser(req.user);

    await db.insertFTTransaction(req.user, {
      value,
      shieldContractAddress: user.selected_coin_shield_contract,
      receiver,
      sender: req.user,
      isTransferred: true,
    });

    await sendWhisperMessage(user.shhIdentity, {
      value,
      shieldContractAddress: user.selected_coin_shield_contract,
      receiver,
      sender: req.user,
      isReceived: true,
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
    value : 200
  }
 * @param {*} req
 * @param {*} res
*/
export async function burnFToken(req, res, next) {
  try {
    await zkp.burnFToken(req.user, req.body);

    const user = await db.fetchUser(req.user);

    await db.insertFTTransaction(req.user, {
      value: req.body.value,
      shieldContractAddress: user.selected_coin_shield_contract,
      isBurned: true,
    });

    res.data = { message: 'Burn Successful' };
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * This function will get the fungible token contract address from the 
 * shield contract which is set by the user.
 * req.body { 
    address : 0x3915e408fd5cff354fd73549d31a4bc66f7335db59bc4e84001473
 }
 * @param {*} req
 * @param {*} res
*/
export async function getFTokenAddress(req, res, next) {
  try {
    res.data = await zkp.getFTokenAddress(req.user);
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * This function will retrieve information of the fungible token.
 * Which will retrieve the balance, name and symbol of the fungible token
 * @apiSuccess (Success 200) {Object} data information of the fungible token.
 *
 * @apiSuccessExample {json} Success response:
 * HTTPS 200 OK
 *
 * data":{
 *    "balance":"0",
 *    "symbol":"OPS",
 *    "name":"EY OpsCoin"
 * }
 *
 * @param {*} req
 * @param {*} res
 */
export async function getFTokenInfo(req, res, next) {
  try {
    res.data = await zkp.getFTokenInfo(req.user);
    next();
  } catch (err) {
    next(err);
  }
}
