import { COLLECTIONS } from '../common/constants';

export default class NftCommitmentTransactionService {
  constructor(_db) {
    this.db = _db;
  }

  /**
   * This function add record in nft_commitment_transaction tables.
   * @param {Object} data
   * data = {
   *  transactionType,
   *  inputCommitments: [{
   *    tokenUri,
   *    tokenId,
   *    salt,
   *    commitment,
   *    commitmentIndex,
   *    owner: {
   *      name,
   *      publicKey,
   *    },
   *  }],
   *  outputCommitments: [{
   *    tokenUri,
   *    tokenId,
   *    salt,
   *    commitment,
   *    commitmentIndex,
   *    owner: {
   *      name,
   *      publicKey,
   *    },
   *  }],
   * }
   */
  insertTransaction(data) {
    return this.db.saveData(COLLECTIONS.NFT_COMMITMENT_TRANSACTION, data);
  }

  /**
   * This function fetch ERC-721 commitment (nft-commitment) transactions
   * from nft_commitment_transction collection
   * @param {object} query
   */
  getTransactions(query) {
    const { pageNo, limit } = query;
    return this.db.getDbData(
      COLLECTIONS.NFT_COMMITMENT_TRANSACTION,
      {},
      undefined,
      { createdAt: -1 },
      parseInt(pageNo, 10),
      parseInt(limit, 10),
    );
  }
}
