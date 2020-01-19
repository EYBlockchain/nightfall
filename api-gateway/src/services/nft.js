import { sendWhisperMessage } from './whisper';
import { db, offchain, zkp } from '../rest';

// ERC-721 token
/**
 * This function will inset NFT in database
 * req.user {
    address: '0x432038accaf756a8936a7f067a8223c2d929d58f',
    name: 'alice',
    publicKey: '0xd68df96f6cddd786290b57fcead37ea670dfe94634f553afeedfef',
    password: 'alicesPassword'
  }
 * req.body {
    tokenURI: 'unique token URI',
    tokenId: '0x1448d8ab4e0d610000000000000000000000000000000000000000000000000',
    shieldContractAddress: '0x04b95c76d5075620a655b707a7901462aea8656c',
    sender: {
      name: 'a',
      address: '0x04b95c76d5075620a655b707a7901462aea8656d',
    }
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
    publicKey: '0xd68df96f6cddd786290b57fcead37ea670dfe94634f553afeedfef',
    password: 'alicesPassword'
  }
 * req.body {
    tokenUri: 'unique token URI',
  }
 * @param {*} req
 * @param {*} res
 */
export async function mintNFToken(req, res, next) {
  const tokenId = `0x${Math.floor(Math.random() * 10e14)
    .toString(16)
    .padEnd(64, '0')}`; // create a random number, left-padded to 64 octets

  const {tokenUri} = req.body;
  try {
    res.data = await zkp.mintNFToken(req.user, {tokenUri, tokenId});
    const {selectedNFTokenShield} = await db.fetchUser(req.user);

    await db.insertNFToken(req.user, {
      tokenUri,
      tokenId,
      shieldContractAddress: selectedNFTokenShield,
      isMinted: true,
    });

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
    publicKey: '0xd68df96f6cddd786290b57fcead37ea670dfe94634f553afeedfef',
    password: 'alicesPassword'
  }
 * req.body {
    tokenId: '0xc3b53ccd640c680000000000000000000000000000000000000000000000000',
    tokenUri: 'unique token name',
    shieldContractAddress: "0x432038accaf756a8936a7f067a8223c2d929d58f"
    receiver: {
      name: 'bob', 
    }
  }
 * @param {*} req
 * @param {*} res
 */
export async function transferNFToken(req, res, next) {
  const { tokenUri, tokenId, receiver, shieldContractAddress } = req.body;
  try {
    receiver.address = await offchain.getAddressFromName(receiver.name);
    res.data = await zkp.transferNFToken(req.user, req.body);

    await db.updateNFTokenByTokenId(req.user, tokenId, {
      tokenUri,
      tokenId,
      shieldContractAddress,
      receiver,
      isTransferred: true,
    });

     const user = await db.fetchUser(req.user);
    await sendWhisperMessage(user.shhIdentity, {
      tokenUri,
      tokenId,
      shieldContractAddress,
      receiver,
      sender: req.user,
      isReceived: true,
      for: 'NFTToken',
    }); // send nft token data to BOB side

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
    publicKey: '0xd68df96f6cddd786290b57fcead37ea670dfe94634f553afeedfef',
    password: 'alicesPassword'
  }
 * req.body {
    tokenId: '0xc3b53ccd640c680000000000000000000000000000000000000000000000000',
    tokenUri: 'unique token name',
  }
 * @param {*} req
 * @param {*} res
 */
export async function burnNFToken(req, res, next) {
  const { tokenUri, tokenId, receiver, shieldContractAddress } = req.body;
  try {
    res.data = await zkp.burnNFToken(req.user, { tokenId });

    await db.updateNFTokenByTokenId(req.user, tokenId, {
      tokenUri,
      tokenId,
      shieldContractAddress,
      receiver,
      isBurned: true,
    });

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
    res.data = await db.getNFTokens(req.user, {
      limit: req.query.limit,
      pageNo: req.query.pageNo,
    });

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
    res.data = await zkp.getNFTokenInfo(req.user);
    next();
  } catch (err) {
    next(err);
  }
}
