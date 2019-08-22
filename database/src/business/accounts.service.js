import { exec } from 'child_process';
import { getProps } from '../config';
import { COLLECTIONS } from '../common/constants';
import { userMapper } from '../mappers';

const { mongo } = getProps();

function updateUserRole() {
  return new Promise((resolve, reject) =>
    exec(
      `mongo ${mongo.databaseName} --host=${mongo.host} -u ${mongo.admin} -p ${mongo.adminPassword} setup-mongo-acl-for-new-users.js`,
      err => (err ? reject(err) : resolve()),
    ),
  );
}

export default class AccountService {
  constructor(_db) {
    this.db = _db;
  }

  /**
   * This function returns a user matching a public key
   * @param {object} options - an object containing public key
   * @returns {object} a user document matching the public key
   */
  getUser(options) {
    return this.db.findOne(COLLECTIONS.USER, options);
  }

  /**
   * This function will create a user document
   * @param {object} data - data contains user details
   * @returns {object} a user object
   */
  async createAccount(data) {
    const mappedData = await userMapper(data);
    await this.db.addUser(data.name, data.password);
    await updateUserRole();
    return this.db.saveData(COLLECTIONS.USER, mappedData);
  }

  /**
   * This function will return all the user collection
   * @returns {array} a user collection
   */
  async getUsers() {
    return this.db.getData(COLLECTIONS.USER, {});
  }

  /**
   * This fucntion is used to add private ethereum accounts to a public account
   * @param {string} account - public accunt
   * @param {object} privateAccountDetails - contains ethereum private account and password
   * @returns {string} a account
   */
  async updateUserWithPrivateAccount(privateAccountDetails) {
    const updateData = {
      $push: {
        accounts: {
          address: privateAccountDetails.address,
          password: privateAccountDetails.password,
        },
      },
    };
    await this.db.updateData(COLLECTIONS.USER, {}, updateData);
    return privateAccountDetails.address;
  }

  /**
   * This function will return all the private ethereum accounts assocated with a public ethereum account
   * @param {object} headers - req object header
   * @returns {array} all private accounts
   */
  getPrivateAccounts(headers) {
    const condition = { address: headers.address };
    return this.db.getData(COLLECTIONS.USER, condition);
  }

  /**
   * This function is used to get details of a private acocunts
   * @param {string} account - private ethereum account
   * @returns {object} a matched private account details
   */
  async getPrivateAccountDetails(account) {
    const condition = {
      'accounts.address': account,
    };
    const projection = {
      'accounts.$': 1,
    };
    const [{ accounts }] = await this.db.getData(COLLECTIONS.USER, condition, projection);
    return accounts[0];
  }

  /**
   * This function will update user whisper key generated at login
   * @param {String} shhIdentity - key hash
   * @returns {Promise}
   */
  updateWhisperIdentity(shhIdentity) {
    return this.db.updateData(
      COLLECTIONS.USER,
      {},
      {
        shh_identity: shhIdentity,
      },
    );
  }

  /**
   * This function will fetch user's whisper key from its user collection
   * @returns {Promise} which resolve to whisper key.
   */
  async getWhisperIdentity() {
    const users = await this.db.getData(COLLECTIONS.USER);
    const shhIdentity = users[0].shh_identity || '';
    return { shhIdentity };
  }

  /**
   * This function will push coinShield contract info in user collection
   * and also make this contract as selected contract for by user for ERC-20 related transactions
   * @param {Object} contractInfo = { contractName, contractAddress }
   * contractName - name of coinShield contract
   * contractAddress - address of coinShield contract
   * @returns {Promise}
   */
  async addCoinShieldContractAddress({ contractName, contractAddress }) {
    await this.db.updateData(
      COLLECTIONS.USER,
      {
        'coin_shield_contracts.contract_address': { $ne: contractAddress },
      },
      {
        $push: {
          coin_shield_contracts: {
            contract_name: contractName,
            contract_address: contractAddress,
          },
        },
      },
    );
    await this.selectCoinShieldContractAddress({ contractAddress });
  }

  /**
   * This function will update coinShield contract info in user collection
   * and also set/uset as selected contract based on 'isSelected' flag
   * @param {Object} contractInfo { contractName, contractAddress, isSelected, isCoinShieldPreviousSelected}
   * contractName - name of coinShield contract
   * contractAddress - address of coinShield contract
   * isSelected - set/unset conteract as selected contract
   * isCoinShieldPreviousSelected - current state of contract; is selected one or not
   * @returns {Promise}
   */
  async updateCoinShieldContractAddress({
    contractName,
    contractAddress,
    isSelected,
    isCoinShieldPreviousSelected,
  }) {
    await this.db.updateData(
      COLLECTIONS.USER,
      {
        'coin_shield_contracts.contract_address': contractAddress,
      },
      {
        $set: {
          [contractName !== undefined
            ? 'coin_shield_contracts.$.contract_name'
            : undefined]: contractName,
        },
      },
    );
    if (isSelected) await this.selectCoinShieldContractAddress({ contractAddress });
    else if (isCoinShieldPreviousSelected)
      await this.selectCoinShieldContractAddress({ contractAddress: null });
  }

  /**
   * This function will make provided contractAddress as selected contract
   * (Private Method)
   * @param {Object} { contractAddress }
   * contractAddress - address of coinShield contract
   * @returns {Promise}
   */
  selectCoinShieldContractAddress({ contractAddress }) {
    return this.db.updateData(
      COLLECTIONS.USER,
      {},
      {
        selected_coin_shield_contract: contractAddress,
      },
    );
  }

  /**
   * This function will delete coinShield contract info from user collection
   * and also remove contract address from selection
   * @param {Object} { contractAddress }
   * contractAddress - address of coinShield contract
   * @returns {Promise}
   */
  async deleteCoinShieldContractAddress({ contractAddress }) {
    await this.db.updateData(
      COLLECTIONS.USER,
      {},
      {
        $pull: {
          coin_shield_contracts: { contract_address: contractAddress },
        },
      },
    );

    const toUpdate = await this.db.findOne(COLLECTIONS.USER, {
      selected_coin_shield_contract: contractAddress,
    });

    if (!toUpdate) return null;
    await this.selectCoinShieldContractAddress({ contractAddress: null });
    return toUpdate;
  }

  /**
   * This function will push tokenShield contract info in user collection
   * and also make this contract as selected contract for by user for ERC-721 related transactions
   * @param {Object} contractInfo = { contractName, contractAddress }
   * contractName - name of tokenShield contract
   * contractAddress - address of tokenShield contract
   * @returns {Promise}
   */
  async addTokenShieldContractAddress({ contractName, contractAddress }) {
    await this.db.updateData(
      COLLECTIONS.USER,
      {
        'token_shield_contracts.contract_address': { $ne: contractAddress },
      },
      {
        $push: {
          token_shield_contracts: {
            contract_name: contractName,
            contract_address: contractAddress,
          },
        },
      },
    );
    await this.selectTokenShieldContractAddress({ contractAddress });
  }

  /**
   * This function will update tokenShield contract info in user collection
   * and also set/uset as selected contract based on 'isSelected' flag
   * @param {Object} contractInfo { contractName, contractAddress, isSelected, isTokenShieldPreviousSelected}
   * contractName - name of tokenShield contract
   * contractAddress - address of tokenShield contract
   * isSelected - set/unset conteract as selected contract
   * isTokenShieldPreviousSelected - current state of contract; is selected one or not
   * @returns {Promise}
   */
  async updateTokenShieldContractAddress({
    contractName,
    contractAddress,
    isSelected,
    isTokenShieldPreviousSelected,
  }) {
    await this.db.updateData(
      COLLECTIONS.USER,
      {
        'token_shield_contracts.contract_address': contractAddress,
      },
      {
        $set: {
          [contractName !== undefined
            ? 'token_shield_contracts.$.contract_name'
            : undefined]: contractName,
        },
      },
    );
    if (isSelected) await this.selectTokenShieldContractAddress({ contractAddress });
    else if (isTokenShieldPreviousSelected)
      await this.selectTokenShieldContractAddress({ contractAddress: null });
  }

  /**
   * This function will make provided contractAddress as selected contract
   * (Private Method)
   * @param {Object} { contractAddress }
   * contractAddress - address of tokenShield contract
   * @returns {Promise}
   */
  selectTokenShieldContractAddress({ contractAddress }) {
    return this.db.updateData(
      COLLECTIONS.USER,
      {},
      {
        selected_token_shield_contract: contractAddress,
      },
    );
  }

  /**
   * This function will delete tokenShield contract info from user collection
   * and also remove contract address from selection
   * @param {Object} { contractAddress }
   * contractAddress - address of tokenShield contract
   * @returns {Promise}
   */
  async deleteTokenShieldContractAddress({ contractAddress }) {
    await this.db.updateData(
      COLLECTIONS.USER,
      {},
      {
        $pull: {
          token_shield_contracts: { contract_address: contractAddress },
        },
      },
    );

    const toUpdate = await this.db.findOne(COLLECTIONS.USER, {
      selected_token_shield_contract: contractAddress,
    });

    if (!toUpdate) return null;
    await this.selectTokenShieldContractAddress({ contractAddress: null });
    return toUpdate;
  }
}
