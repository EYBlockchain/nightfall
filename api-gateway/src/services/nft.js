import { whisperTransaction } from './whisper';
import { db, offchain, zkp } from '../rest';

// ERC-721 token
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
  const reqBody = {
    tokenID:
      req.body.tokenID || `0x${(Math.random() * 1000000000000000000000000000000e46).toString(16)}`,
    tokenURI: req.body.tokenURI || '',
  };

  try {
    const { data } = await zkp.mintNFToken(req.user, reqBody);

    const user = await db.fetchUser(req.user);

    await db.addNFToken(req.user, {
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
  try {
    const receiverAddress = await offchain.getAddressFromName(req.body.receiver_name);

    const { data } = await zkp.transferNFToken(req.user, {
      tokenID: req.body.tokenID,
      to: receiverAddress,
    });

    const nftToken = {
      uri: req.body.uri,
      tokenId: req.body.tokenID,
      shieldContractAddress: req.body.contractAddress,
    };

    await db.updateNFToken(req.user, {
      ...nftToken,
      receiver: req.body.receiver_name,
      receiverAddress,
      isTransferred: true,
    });

    await whisperTransaction(req, {
      ...nftToken,
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
  try {
    const { data } = await zkp.burnNFToken(req.user, {
      tokenID: req.body.tokenID,
    });

    await db.updateNFToken(req.user, {
      uri: req.body.uri,
      tokenId: req.body.tokenID,
      shieldContractAddress: req.body.contractAddress,
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
