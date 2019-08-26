import { whisperTransaction } from './whisper';
import { db, offchain, zkp } from '../rest';
import Response from '../routes/response/response';

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
  const response = new Response();
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
  const response = new Response();

  try {
    const { address } = await offchain.getAddressFromName(req.body.receiver_name);

    const { data } = await zkp.transferNFToken(req.user, {
      tokenID: req.body.tokenID,
      to: address,
    });

    const nftToken = {
      uri: req.body.uri,
      tokenId: req.body.tokenID,
      shieldContractAddress: req.body.contractAddress,
    };

    await db.updateNFToken(req.user, {
      ...nftToken,
      transferee: req.body.receiver_name,
      transfereeAddress: address,
      isTransferred: true,
    });

    await whisperTransaction(req, {
      ...nftToken,
      transferee: req.body.receiver_name,
      transferor: req.user.name,
      transferorAddress: req.user.address,
      for: 'NFTToken',
    }); // send nft token data to BOB side

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
  const response = new Response();

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
 * This function will fetch all non-fungible token from database.
 * req.query {
    limit: 5, // optionial
    pageNo: 1 // optionial
   }
 * @param {*} req
 * @param {*} res
*/
export async function getNFTokens(req, res, next) {
  const response = new Response();

  try {
    const user = await db.fetchUser(req.user);
    const data = await db.getNFTokens(req.user, {
      shieldContractAddress: user.selected_token_shield_contract,
      limit: req.query.limit,
      pageNo: req.query.pageNo,
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
