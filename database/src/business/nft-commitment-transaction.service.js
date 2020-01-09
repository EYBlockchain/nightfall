import { COLLECTIONS } from '../common/constants';

export default class NftCommitmentTransactionService {
  constructor(_db) {
    this.db = _db;
  }

  /**
   * This function add record in nft_commitment_transaction tables.
   * @param {Object} data
   * data = {
   *  transaction_type,
   *  input_commitments: [{
   *    token_uri,
   *    token_id,
   *    salt,
   *    commitment,
   *    commitment_index,
   *    owner: {
   *      name,
   *      public_key,
   *    },
   *  }],
   *  output_commitments: [{
   *    token_uri,
   *    token_id,
   *    salt,
   *    commitment,
   *    commitment_index,
   *    owner: {
   *      name,
   *      public_key,
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
      { created_at: -1 },
      parseInt(pageNo, 10),
      parseInt(limit, 10),
    );
  }
}
