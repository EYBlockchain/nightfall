import { COLLECTIONS } from '../common/constants';

export default class FtCommitmentTransactionService {
  constructor(_db) {
    this.db = _db;
  }

  /**
   * This function add record in ft_commitment_transaction tables.
   * @param {Object} data
   * data = {
   *  transaction_type,
   *  outgoing_commitments: [{
   *    value,
   *    salt,
   *    commitment,
   *    commitmentIndex,
   *    owner,
   *  }]
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
      { createdAt: -1 },
      parseInt(pageNo, 10),
      parseInt(limit, 10),
    );
  }
}
