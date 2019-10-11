import { whisperTransaction } from './whisper';
import { db, offchain, zkp } from '../rest';

// ERC-721 token
/**
 * This function will inset NFT in database
 * req.user {
    address: '0x432038accaf756a8936a7f067a8223c2d929d58f',
    name: 'alice',
    pk_A: '0xd68df96f6cddd786290b57fcead37ea670dfe94634f553afeedfef',
    password: 'alicesPassword'
  }
 * req.body {
    uri: 'unique token URI',
    tokenId: '0x1448d8ab4e0d610000000000000000000000000000000000000000000000000',
    shieldContractAddress: '0x04b95c76d5075620a655b707a7901462aea8656c',
    sender: 'a',
    senderAddress: '0x04b95c76d5075620a655b707a7901462aea8656d',
  }
 * @param {*} req
 * @param {*} res
 */
export async function insertNFTToDb(req, res, next) {
  try {
    res.data = await db.insertNFToken(req.user, req.body);
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * This function will fetch NFT transactions
 * req.user {
    address: '0x432038accaf756a8936a7f067a8223c2d929d58f',
    name: 'alice',
    pk_A: '0xd68df96f6cddd786290b57fcead37ea670dfe94634f553afeedfef',
    password: 'alicesPassword'
  }
 * req.query {
    pageNo: 1,
    limit: 4
  }
 * @param {*} req
 * @param {*} res
 */
export async function getNFTTransactions(req, res, next) {
  try {
    res.data = await db.getNFTTransactions(req.user, req.query);
    next();
  } catch (err) {
    next(err);
  }
}
/**
 * This function will mint a non-fungible token
 * req.user {
    address: '0x432038accaf756a8936a7f067a8223c2d929d58f',
    name: 'alice',
    pk_A: '0xd68df96f6cddd786290b57fcead37ea670dfe94634f553afeedfef',
    password: 'alicesPassword'
  }
 * req.body {
    tokenURI: 'unique token URI'
  }
 * @param {*} req
 * @param {*} res
 */
export async function mintNFToken(req, res, next) {
  console.log('mintNFToken req.body.tokenID:', req.body.tokenID);
  const randomHex = `0x${Math.floor(Math.random() * 10e14)
    .toString(16)
    .padEnd(64, '0')}`; // create a random number, left-padded to 64 octets
  const reqBody = {
    tokenID: req.body.tokenID || randomHex,
    tokenURI: req.body.tokenURI || '',
  };
  console.log('mintNFToken reqBody.tokenID:', reqBody.tokenID);

  try {
    const { data } = await zkp.mintNFToken(req.user, reqBody);

    const user = await db.fetchUser(req.user);

    await db.insertNFToken(req.user, {
      uri: reqBody.tokenURI,
      tokenId: reqBody.tokenID,
      shieldContractAddress: user.selected_token_shield_contract,
      isMinted: true,
    });

    res.data = data;
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * This function will tranasfer non-fungible token to a transfree.
 * req.user {
    address: '0x432038accaf756a8936a7f067a8223c2d929d58f',
    name: 'alice',
    pk_A: '0xd68df96f6cddd786290b57fcead37ea670dfe94634f553afeedfef',
    password: 'alicesPassword'
  }
 * req.body {
    tokenID: '0xc3b53ccd640c680000000000000000000000000000000000000000000000000',
    uri: 'unique token name',
    receiver_name: 'bob'.
    contractAddress: 'Oxad23..' // optional
  }
 * @param {*} req
 * @param {*} res
 */
export async function transferNFToken(req, res, next) {
  const { uri, tokenID, contractAddress } = req.body;

  try {
    const receiverAddress = await offchain.getAddressFromName(req.body.receiver_name);
    const { data } = await zkp.transferNFToken(req.user, {
      tokenID,
      to: receiverAddress,
    });

    await db.updateNFTokenByTokenId(req.user, tokenID, {
      uri,
      tokenId: tokenID,
      shieldContractAddress: contractAddress,
      receiver: req.body.receiver_name,
      receiverAddress,
      isTransferred: true,
    });

    await whisperTransaction(req, {
      uri,
      tokenId: tokenID,
      shieldContractAddress: contractAddress,
      receiver: req.body.receiver_name,
      sender: req.user.name,
      senderAddress: req.user.address,
      for: 'NFTToken',
    }); // send nft token data to BOB side

    res.data = data;
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * This function will burn fungible token
 * req.user {
    address: '0x432038accaf756a8936a7f067a8223c2d929d58f',
    name: 'alice',
    pk_A: '0xd68df96f6cddd786290b57fcead37ea670dfe94634f553afeedfef',
    password: 'alicesPassword'
  }
 * req.body {
    tokenID: '0xc3b53ccd640c680000000000000000000000000000000000000000000000000',
    uri: 'unique token name',
    contractAddress: 'Oxad23..' // optional
  }
 * @param {*} req
 * @param {*} res
 */
export async function burnNFToken(req, res, next) {
  const { uri, tokenID, contractAddress } = req.body;
  try {
    const { data } = await zkp.burnNFToken(req.user, { tokenID });

    await db.updateNFTokenByTokenId(req.user, tokenID, {
      uri,
      tokenId: tokenID,
      shieldContractAddress: contractAddress,
      isBurned: true,
    });

    res.data = data;
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * This function will fetch all non-fungible token from database.
 * req.query {
    limit: 5, // optionial
    pageNo: 1 // optionial
  }
 * @param {*} req
 * @param {*} res
 */
export async function getNFTokens(req, res, next) {
  try {
    const user = await db.fetchUser(req.user);
    const data = await db.getNFTokens(req.user, {
      shieldContractAddress: user.selected_token_shield_contract,
      limit: req.query.limit,
      pageNo: req.query.pageNo,
    });

    res.data = data;
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * This function will get the non-fungible token contract address from the
 * shield contract which is set by the user.
 * * @param {*} req
 * @param {*} res
 */
export async function getNFTokenAddress(req, res, next) {
  try {
    res.data = await zkp.getNFTokenAddress(req.user);
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * This function will get information of a non-fungible token.
 * Which will retrieve the balance, name and symbol of the non fungible token
 * @param {*} req
 * @param {*} res
 */
export async function getNFTokenInfo(req, res, next) {
  try {
    const response = await zkp.getNFTokenInfo(req.user);
    res.data = response.data;
    next();
  } catch (err) {
    next(err);
  }
}
