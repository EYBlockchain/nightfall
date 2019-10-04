import { setWhisperIdentityAndSubscribe } from './whisper';
import { accounts, db, offchain, zkp } from '../rest';
import { createToken } from '../middlewares'; /* Authorization filter used to verify Role of the user */

/**
 * This function is used to login to the application
 * req.body {
    "name": "x",
    "password": "x"
  }
 * @param {*} req
 * @param {*} res
 */
export async function loginHandler(req, res, next) {
  const { name, password } = req.body;

  try {
    const data = await db.configureDBconnection({ name, password });
    await accounts.unlockAccount({ address: data.address, password });
    // get jwt token
    const token = createToken(data, password);

    const userData = {
      address: data.address,
      name: data.name,
      jwtToken: token,
      sk_A: data.secretkey,
    };
    await setWhisperIdentityAndSubscribe(userData);

    res.data = { ...data, token };
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * This function will create an account
 * req.body {
    name: 'bob',
    email: 'bob@email.com',
    password: 'bobsPassword'
  }
 * @param {*} req
 * @param {*} res
 */
export async function createAccountHandler(req, res, next) {
  const { password, name } = req.body;
  try {
    const status = await offchain.isNameInUse(name);
    if (status) throw Error('Name already in use');

    const address = (await accounts.createAccount(password)).data;
    const shhIdentity = '';

    const data = await db.createUser({
      ...req.body,
      address,
      shhIdentity,
    });

    await accounts.unlockAccount({ address, password });

    await offchain.setName(address, name);
    await offchain.setZkpPublicKey(address, {
      pk: data.publickey,
    });

    res.data = data;
    next();
  } catch (err) {
    console.log(err);
    next(err);
  }
}

// vk APIs
export async function loadVks(req, res, next) {
  try {
    const data = await zkp.loadVks(
      {
        ...req.body,
      },
      req.headers,
    );

    res.data = data;
    next();
  } catch (err) {
    next(err);
  }
}

// sheild contracts for both ERC-20 and ERC-721
/**
 * This function will set sheild contract to to its type
 * @param {Object} user
 * @param {String} contractAddress
 */
function setShieldContract(user, contractAddress) {
  return new Promise(function setShieldDetails(resolve) {
    zkp
      .setTokenShield(user, { tokenShield: contractAddress })
      .then(() => resolve('token'))
      .catch(() => zkp.unSetTokenShield(user));
    zkp
      .setCoinShield(user, { coinShield: contractAddress })
      .then(() => resolve('coin'))
      .catch(() => zkp.unSetCoinShield(user));
  });
}

/**
 * This function add Sheild contract inforamtion to User.
 * req.body {
    "contractAddress": "0x674eD18709c896dD74a8CA3378BBF37333faC345",
    "contractName": "tokenShield"
    }
 * @param {*} req
 * @param {*} res
*/
export async function addContract(req, res, next) {
  const { contractAddress, contractName, isSelected } = req.body;

  try {
    const type = await setShieldContract(req.user, contractAddress);
    if (type === 'coin')
      await db.addFTShieldContractInfo(req.user, {
        contractAddress,
        contractName,
        isSelected,
      });
    if (type === 'token')
      await db.addNFTShieldContractInfo(req.user, {
        contractAddress,
        contractName,
        isSelected,
      });

    res.data = { message: `Added of type ${type}` };
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * This function will update sheild contract information
   will change primary selected contract for user of both
   ERC-20 and ERC-721.
 * in body "tokenShield" and "coinShield" object are optional.
 * req.body {
    "tokenShield": {
      "contractAddress": "0x88B8d386BA803423482f325Be664607AE1Db6E1F",
      "contractName": "tokenShield1",
      "isSelected": true
    },
    "coinShield": {
      "contractAddress": "0x3BBa2cdBb2376F07017421878540c424aAB61294",
      "contractName": "coinShield0",
      "isSelected": false
    }
  }
 * @param {*} req
 * @param {*} res
*/
export async function updateContract(req, res, next) {
  const { tokenShield, coinShield } = req.body;

  try {
    const user = await db.fetchUser(req.user);

    // if update coinShield data
    if (coinShield) {
      const { contractName, contractAddress, isSelected } = coinShield;

      const isFTShieldPreviousSelected =
        user.selected_coin_shield_contract === coinShield.contractAddress;

      await db.updateFTShieldContractInfoByContractAddress(req.user, contractAddress, {
        contractName,
        isSelected,
        isFTShieldPreviousSelected,
      });

      if (isSelected) await zkp.setCoinShield(req.user, { coinShield: contractAddress });
      else if (isFTShieldPreviousSelected) await zkp.unSetCoinShield(req.user);
    }

    // if update tokenShield data
    if (tokenShield) {
      const { contractName, contractAddress, isSelected } = tokenShield;

      const isNFTShieldPreviousSelected =
        user.selected_token_shield_contract === tokenShield.contractAddress;

      await db.updateNFTShieldContractInfoByContractAddress(req.user, contractAddress, {
        contractName,
        isSelected,
        isNFTShieldPreviousSelected,
      });

      if (isSelected) await zkp.setTokenShield(req.user, { tokenShield: contractAddress });
      else if (isNFTShieldPreviousSelected) await zkp.unSetTokenShield(req.user);
    }

    res.data = { message: 'Contract Address updated' };
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * This function will delete add contract information, and
   will also remove contract from zkp is set as primary.
 * in params "token_shield" and "coin_shield" keys are optional.
 * req.params {
    coin_shield: "0x3BBa2cdBb2376F07017421878540c424aAB61294",
    token_shield: "0x3BBa2cdBb2376F07017421878540c424aAB61294"
  }
 * @param {*} req
 * @param {*} res
*/
export async function deleteContract(req, res, next) {
  const { query } = req;

  try {
    if (query.coin_shield) {
      const data = await db.deleteFTShieldContractInfoByContractAddress(
        req.user,
        query.coin_shield,
      );
      if (data.status) await zkp.unSetCoinShield(req.user);
    }
    if (query.token_shield) {
      const data = await db.deleteNFTShieldContractInfoByContractAddress(
        req.user,
        query.token_shield,
      );
      if (data.status) await zkp.unSetTokenShield(req.user);
    }

    res.data = { message: 'Contract Address Removed' };
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * This function will retrieve all the registered names.
 * @param {*} req
 * @param {*} res
 */
export async function getAllRegisteredNames(req, res, next) {
  try {
    res.data = await offchain.getRegisteredNames();
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * This function will fetch token commitments counts from database
 * @param {*} req
 * @param {*} res
 */
export async function getTokenCommitmentCounts(req, res, next) {
  try {
    const nftCommitments = await db.getNFTCommitments(req.user);
    const ftCommitments = await db.getFTCommitments(req.user);

    let totalAmount = 0;
    if (ftCommitments.length) {
      ftCommitments.forEach(ftCommitment => {
        totalAmount += Number(ftCommitment.coin_value);
      });
    }

    res.data = {
      nftCommitmentCount: nftCommitments.length,
      ftCommitmentCount: totalAmount,
    };

    next();
  } catch (err) {
    next(err);
  }
}

/**
 * This function will fetch user details from database
 * @param {*} req
 * @param {*} res
 */
export async function getUserDetails(req, res, next) {
  try {
    res.data = await db.fetchUser(req.user);
    next();
  } catch (err) {
    next(err);
  }
}
