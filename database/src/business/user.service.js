import { exec } from 'child_process';
import mongoose from 'mongoose';
import config from 'config';
import utils from 'zkp-utils';

import { COLLECTIONS } from '../common/constants';
import dbConnections from '../common/dbConnections';
import { userMapper } from '../mappers';

const mongo = config.get('mongo');

function updateUserRole() {
  return new Promise((resolve, reject) =>
    exec(
      `mongo ${mongo.databaseName} --host=${mongo.host} -u ${mongo.admin} -p ${mongo.adminPassword} setup-mongo-acl-for-new-users.js`,
      err => (err ? reject(err) : resolve()),
    ),
  );
}

export default class UserService {
  constructor(_db) {
    this.db = _db;
  }

  /**
   * This function returns a user matching a public key
   * @param {object} options - an object containing public key
   * @returns {object} a user document matching the public key
   */
  getUser() {
    return this.db.findOne(COLLECTIONS.USER);
  }

  /**
   * This function will create a user document
   * @param {object} data - data contains user details
   * @returns {object} a user object
   */
  async createUser(data) {
    const secretkey = await utils.rndHex(32);
    const publickey = utils.hash(secretkey);

    const mappedData = userMapper({ ...data, secretkey, publickey });

    await this.db.addUser(data.name, data.password);
    await updateUserRole();
    return this.db.saveData(COLLECTIONS.USER, mappedData);
  }

  /**
   * This function will update user
   * @param {Object} data
   * @returns {Promise}
   */
  async updateUser(data) {
    const mappedData = userMapper(data);
    return this.db.updateData(COLLECTIONS.USER, {}, mappedData);
  }

  /**
   * This fucntion is used to add private ethereum accounts to a public account
   * @param {string} account - public accunt
   * @param {object} privateAccountDetails - contains ethereum private account and password
   * @returns {string} a account
   */
  async insertPrivateAccountHandler({ address, password }) {
    const updateData = {
      $push: {
        accounts: { address, password },
      },
    };
    return this.db.updateData(COLLECTIONS.USER, {}, updateData);
  }

  /**
   * This fucntion is used create db connection for a user if not present.
   * @param {string} name - user name
   * @param {string} password - user password
   * @returns {object} mongo db connection
   */
  static async setDBconnection(name, password) {
    if (!password) throw new Error('Password is empty');

    if (!dbConnections[name]) {
      dbConnections[name] = await mongoose.createConnection(
        `mongodb://${name}:${password}@${mongo.host}:${mongo.port}/${mongo.databaseName}`,
        { useNewUrlParser: true },
      );
    }
    return dbConnections[name];
  }

  /**
   * This function will make provided contractAddress as selected contract
   * (Private Method)
   * @param {Object} { contractAddress }
   * contractAddress - address of coinShield contract
   * @returns {Promise}
   */
  selectFTShieldContractAddress({ contractAddress }) {
    return this.db.updateData(
      COLLECTIONS.USER,
      {},
      {
        selected_coin_shield_contract: contractAddress,
      },
    );
  }

  /**
   * This function will push coinShield contract info in user collection
   * and also make this contract as selected contract for by user for ERC-20 related transactions
   * @param {Object} contractInfo = { contractName, contractAddress }
   * contractName - name of coinShield contract
   * contractAddress - address of coinShield contract
   * @returns {Promise}
   */
  async addFTShieldContractInfo({ contractName, contractAddress, isSelected }) {
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
    if (isSelected) await this.selectFTShieldContractAddress({ contractAddress });
  }

  /**
   * This function will update coinShield contract info in user collection
   * and also set/uset as selected contract based on 'isSelected' flag
   * @param {Object} contractInfo { contractName, contractAddress, isSelected, isFTShieldPreviousSelected}
   * contractName - name of coinShield contract
   * contractAddress - address of coinShield contract
   * isSelected - set/unset conteract as selected contract
   * isFTShieldPreviousSelected - current state of contract; is selected one or not
   * @returns {Promise}
   */
  async updateFTShieldContractInfoByContractAddress(
    contractAddress,
    { contractName, isSelected, isFTShieldPreviousSelected },
  ) {
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
    if (isSelected) await this.selectFTShieldContractAddress({ contractAddress });
    else if (isFTShieldPreviousSelected)
      await this.selectFTShieldContractAddress({ contractAddress: null });
  }

  /**
   * This function will delete coinShield contract info from user collection
   * and also remove contract address from selection
   * @param {Object} { contractAddress }
   * contractAddress - address of coinShield contract
   * @returns {Promise}
   */
  async deleteFTShieldContractInfoByContractAddress(contractAddress) {
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
    await this.selectFTShieldContractAddress({ contractAddress: null });
    return toUpdate;
  }

  /**
   * This function will make provided contractAddress as selected contract
   * (Private Method)
   * @param {Object} { contractAddress }
   * contractAddress - address of tokenShield contract
   * @returns {Promise}
   */
  selectNFTShieldContractAddress({ contractAddress }) {
    return this.db.updateData(
      COLLECTIONS.USER,
      {},
      {
        selected_token_shield_contract: contractAddress,
      },
    );
  }

  /**
   * This function will push tokenShield contract info in user collection
   * and also make this contract as selected contract for by user for ERC-721 related transactions
   * @param {Object} contractInfo = { contractName, contractAddress }
   * contractName - name of tokenShield contract
   * contractAddress - address of tokenShield contract
   * @returns {Promise}
   */
  async addNFTShieldContractInfo({ contractName, contractAddress, isSelected }) {
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
    if (isSelected) await this.selectNFTShieldContractAddress({ contractAddress });
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
  async updateNFTShieldContractInfoByContractAddress(
    contractAddress,
    { contractName, isSelected, isNFTShieldPreviousSelected },
  ) {
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
    if (isSelected) await this.selectNFTShieldContractAddress({ contractAddress });
    else if (isNFTShieldPreviousSelected)
      await this.selectNFTShieldContractAddress({ contractAddress: null });
  }

  /**
   * This function will delete tokenShield contract info from user collection
   * and also remove contract address from selection
   * @param {Object} { contractAddress }
   * contractAddress - address of tokenShield contract
   * @returns {Promise}
   */
  async deleteNFTShieldContractInfoByContractAddress(contractAddress) {
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
    await this.selectNFTShieldContractAddress({ contractAddress: null });
    return toUpdate;
  }
}
