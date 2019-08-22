import { AccountService, NftCommitmentService, FtCommitmentService } from '../business';

/**
 * this function is used to add ERC-20 Contract related information in user table, such as contract addresses,
 * account address to which user hold ERC-20 token and password of that account address used to unlock account.
 * req.body = {
 *  contractAddress,
 *  accountAddress,
 *  accountPassword
 * }
 * @param {*} req
 * @param {*} res
 */
async function addCoinShieldContractAddress(req, res, next) {
  const accountService = new AccountService(req.user.db);
  try {
    await accountService.addCoinShieldContractAddress(req.body);
    res.data = { message: 'Contract Information Added' };
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * this function is used to remove ERC-20 contract related information from user table
 * req.query = {
 *  contractAddress
 * }
 * @param {*} req
 * @param {*} res
 */
async function deleteCoinShieldContractAddress(req, res, next) {
  const accountService = new AccountService(req.user.db);
  try {
    const status = await accountService.deleteCoinShieldContractAddress(req.query);
    res.data = { message: 'Contract Information Removed', status };
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * this function is used to update ERC-20 Contract related information in user table, such as contract addresses,
 * account address to which user hold ERC-20 token and password of that account address used to unlock account.
 * req.body = {
 *  contractAddress,
 *  accountAddress,
 *  accountPassword
 * }
 * @param {*} req
 * @param {*} res
 */
async function updateCoinShieldContractAddress(req, res, next) {
  const accountService = new AccountService(req.user.db);
  try {
    await accountService.updateCoinShieldContractAddress(req.body);
    res.data = { message: 'Contract Information Updated' };
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * this function is used to add ERC-721 contract related information in user table, such as contract addresses,
 * account address to which user hold ERC-721 token and password of that account address used to unlock account.
 * req.body = {
 *  contractAddress,
 *  accountAddress,
 *  accountPassword
 * }
 * @param {*} req
 * @param {*} res
 */
async function addTokenShieldContractAddress(req, res, next) {
  const accountService = new AccountService(req.user.db);
  try {
    await accountService.addTokenShieldContractAddress(req.body);
    res.data = { message: 'Contract Information Added' };
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * this function is used to remove ERC-721 contract related information from user table
 * req.query = {
 *  contractAddress
 * }
 * @param {*} req
 * @param {*} res
 */
async function deleteTokenShieldContractAddress(req, res, next) {
  const accountService = new AccountService(req.user.db);
  try {
    const status = await accountService.deleteTokenShieldContractAddress(req.query);
    res.data = { message: 'Contract Information Removed', status };
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * this function is used to update ERC-721 Contract related information in user table, such as contract addresses,
 * account address to which user hold ERC-721 token and password of that account address used to unlock account.
 * req.body = {
 *  contractAddress,
 *  accountAddress,
 *  accountPassword
 * }
 * @param {*} req
 * @param {*} res
 */
async function updateTokenShieldContractAddress(req, res, next) {
  const accountService = new AccountService(req.user.db);
  try {
    await accountService.updateTokenShieldContractAddress(req.body);
    res.data = { message: 'Contract Information Updated' };
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * This method called at login, assigning new whisper key in user at db.
 *
 * @param {*} req
 * @param {*} res
 */
async function updateWhisperIdentity(req, res, next) {
  const { shhIdentity } = req.body;
  const accountService = new AccountService(req.user.db);
  try {
    await accountService.updateWhisperIdentity(shhIdentity);
    res.data = { message: 'Whisper-key updated' };
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * This method fetch whisper key associated with user.
 *
 * @param {*} req
 * @param {*} res
 */
async function getWhisperIdentity(req, res, next) {
  const accountService = new AccountService(req.user.db);
  try {
    res.data = await accountService.getWhisperIdentity();
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * This function is used to get account balances
 * @param {*} req
 * @param {*} res
 */
async function getCountHandler(req, res, next) {
  const nftCommitmentService = new NftCommitmentService(req.user.db);
  const ftCommitmentService = new FtCommitmentService(req.user.db);
  try {
    const tokens = await nftCommitmentService.getToken();
    const coins = await ftCommitmentService.getCoin();
    let totalAmount = 0;
    if (coins.length) {
      coins.forEach(coin => {
        totalAmount += Number(coin.coin_value);
      });
    }
    res.data = { tokenCount: tokens ? tokens.length : 0, totalAmount };
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * This function is used to fetch user by name (login purpose).
 * req.body = { name: 'a' }
 * @param {*} req
 * @param {*} res
 */
async function getUserByName(req, res, next) {
  const accountService = new AccountService(req.user.db);
  try {
    res.data = await accountService.getUser({ name: req.body.name });
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * This function will create a user(public ethereum account)
 * req.body = {
 *  name: 'a',
 *  email: 'a',
 *  address: '0xE237b19f7a9f2E92018a68f4fB07C451F578fa26' => Ethereum account
 * }
 * @param {*} req
 * @param {*} res
 */
async function createAccountHandler(req, res, next) {
  const accountService = new AccountService(req.user.db);
  try {
    res.data = await accountService.createAccount(req.body);
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * This function is used to create private account for a user
 * req.body = {
 *  address: '0x256140f466b2e56E3ae0055551591FE46664976d', // this is the newly created private account
 *  password: '1535612512928', // and password used to create private account
 * }
 * req.headers.address = '0xE237b19f7a9f2E92018a68f4fB07C451F578fa26' // this is user public account
 * @param {*} req
 * @param {*} res
 */
async function createPrivateAccountHandler(req, res, next) {
  const accountService = new AccountService(req.user.db);
  try {
    res.data = await accountService.updateUserWithPrivateAccount(req.body);
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * This function is used to get the user using public key
 * req.query = { pk_B: "0x48741c46eada3492"}
 * @param {*} req
 * @param {*} res
 */
async function getUserHandler(req, res, next) {
  const accountService = new AccountService(req.user.db);
  try {
    res.data = await accountService.getUser();
    next();
  } catch (err) {
    next(err);
  }
}

// initializing routes
export default function(router) {
  // Route to get user by name, also use while login
  router.route('/login').post(getUserByName);

  // Route to create a public Account
  router.route('/createAccount').post(createAccountHandler);

  // Route to create a private account & get private account
  router.route('/privateAccount').post(createPrivateAccountHandler);

  // Route to get a user
  router.route('/user').get(getUserHandler);

  router.route('/count').get(getCountHandler);

  router
    .route('/user/whisperIdentity')
    .get(getWhisperIdentity)
    .patch(updateWhisperIdentity);

  router
    .route('/user/coinShield')
    .post(addCoinShieldContractAddress)
    .put(updateCoinShieldContractAddress)
    .delete(deleteCoinShieldContractAddress);

  router
    .route('/user/tokenShield')
    .post(addTokenShieldContractAddress)
    .put(updateTokenShieldContractAddress)
    .delete(deleteTokenShieldContractAddress);
}
