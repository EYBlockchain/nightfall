import { getProps } from '../config';
import { COLLECTIONS } from '../common/constants';
import {
  UserSchema,
  nftSchema,
  nftTransactionSchema,
  nftCommitmentSchema,
  nftCommitmentTransactionSchema,
  ftTransactionSchema,
  ftCommitmentSchema,
  ftCommitmentTransactionSchema,
} from '../models';

const { mongo } = getProps();

export default class DB {
  constructor(db, username) {
    this.database = db;
    this.username = username;
    if (!username) return;
    this.createTablesForUser();
  }

  createTablesForUser() {
    const { username, database } = this;
    this.Models = {
      user: database.model(`${username}_${COLLECTIONS.USER}`, UserSchema),
      nft: database.model(`${username}_${COLLECTIONS.NFT}`, nftSchema),
      nft_transaction: database.model(
        `${username}_${COLLECTIONS.NFT_TRANSACTION}`,
        nftTransactionSchema,
      ),
      nft_commitment: database.model(
        `${username}_${COLLECTIONS.NFT_COMMITMENT}`,
        nftCommitmentSchema,
      ),
      nft_commitment_transaction: database.model(
        `${username}_${COLLECTIONS.NFT_COMMITMENT_TRANSACTION}`,
        nftCommitmentTransactionSchema,
      ),
      ft_transaction: database.model(
        `${username}_${COLLECTIONS.FT_TRANSACTION}`,
        ftTransactionSchema,
      ),
      ft_commitment: database.model(`${username}_${COLLECTIONS.FT_COMMITMENT}`, ftCommitmentSchema),
      ft_commitment_transaction: database.model(
        `${username}_${COLLECTIONS.FT_COMMITMENT_TRANSACTION}`,
        ftCommitmentTransactionSchema,
      ),
    };
  }

  async saveData(modelName, data) {
    try {
      const Model = this.Models[modelName];
      const modelInstance = new Model(data);
      const successData = await modelInstance.save();
      return Promise.resolve(successData);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  async getData(modelName, query = {}) {
    try {
      const model = this.Models[modelName];
      const data = await model.find(query).exec();
      return Promise.resolve(data);
    } catch (e) {
      console.log('DB error', e);
      return Promise.reject(e);
    }
  }

  async getDbData(
    modelName,
    query,
    projection = { path: '', select: '' },
    sort = {},
    pageNo = 1,
    limit = 5,
  ) {
    try {
      const model = this.Models[modelName];
      const data = await model
        .find(query)
        .limit(limit)
        .skip(limit * (pageNo - 1))
        .sort(sort)
        .populate(projection)
        .exec();
      const totalCount = await model
        .find(query)
        .countDocuments()
        .exec();
      return Promise.resolve({ data, totalCount });
    } catch (e) {
      return Promise.reject(e);
    }
  }

  async getDbValues(modelName, query, projection, sort = {}, pageNo, limit) {
    try {
      const model = this.Models[modelName];
      const mQuery = model.find(query);
      if (limit) {
        mQuery.limit(limit);
      }
      if (pageNo) {
        mQuery.skip(limit * (pageNo - 1));
      }
      if (sort) {
        mQuery.sort(sort);
      }
      if (projection) {
        mQuery.populate(projection);
      }

      const data = await mQuery.exec();
      return Promise.resolve({ data });
    } catch (e) {
      return Promise.reject(e);
    }
  }

  async findOne(modelName, query) {
    try {
      const model = this.Models[modelName];
      const data = await model.findOne(query);
      return Promise.resolve(data);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  async getListData(modelName, query, page) {
    try {
      const model = this.Models[modelName];
      const data = await model
        .find(query)
        .skip(page.index * page.size)
        .limit(page.size)
        .exec();
      return Promise.resolve(data);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  async updateData(modelName, condition, updateData, options = { upsert: true }) {
    try {
      const model = this.Models[modelName];
      const data = await model.updateOne(condition, updateData, options);
      return Promise.resolve(data);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  async aggregation(modelName, condition, projection, options) {
    try {
      const model = this.Models[modelName];
      const pipeline = [{ $match: condition }];

      if (projection) pipeline.push(projection);

      if (options) pipeline.push(options);

      const data = await model.aggregate(pipeline);

      return Promise.resolve(data);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  async populate(modelName, data, populates) {
    try {
      const model = this.Models[modelName];
      return await model.populate(data, populates);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  addUser(name, password) {
    return this.database.db.addUser(name, password, {
      roles: [
        {
          role: 'read',
          db: mongo.databaseName,
        },
      ],
    });
  }
}
