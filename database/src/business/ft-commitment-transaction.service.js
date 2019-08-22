import { COLLECTIONS } from '../common/constants';

export default class FtCommitmentTransactionService {
  constructor(_db) {
    this.db = _db;
  }

  /**
   * This function add record in ft_commitment_transaction tables.
   * @param {Object} data
   * data = {
   *  type,
   *  coin_value,
   *  salt,
   *  coin_commitment,
   *  coin_commitment_index,
   *  transferred_amount,
   *  transferred_salt,
   *  transferred_commitment,
   *  transferred_commitment_index,
   *  change_amount,
   *  change_salt,
   *  change_commitment,
   *  change_commitment_index,
   *  transferee,
   *  used_coin_commitments: [{
   *   coin_value: String,
   *   salt: String,
   *  }],
   * }
   */
  insertTransaction(data) {
    return this.db.saveData(COLLECTIONS.FT_COMMITMENT_TRANSACTION, data);
  }

  /**
   * This function fetch ERC-20 commitment (ft-commitment) transactions
   * from ft_commitment_transction collection
   * @param {object} query
   */
  getTransactions(query) {
    const { pageNo, limit } = query;
    return this.db.getDbData(
      COLLECTIONS.FT_COMMITMENT_TRANSACTION,
      {},
      undefined,
      { created_at: -1 },
      parseInt(pageNo, 10),
      parseInt(limit, 10),
    );
  }
}
