import { COLLECTIONS } from '../common/constants';

export default class FtTransactionService {
  constructor(_db) {
    this.db = _db;
  }

  /**
   * This function add record in ft_transaction tables.
   * @param {Object} data
   * data = {
   *  amount,
   *  shield_contract_address,
   *  type,
   *  transferor,
   *  transferor_address,
   *  transferee,
   *  transferee_address,
   * }
   */
  insertTransaction(data) {
    return this.db.saveData(COLLECTIONS.FT_TRANSACTION, data);
  }

  /**
   * This function fetch ERC-20 (ft) transactions
   * in ft_transction collection
   * @param {object} query
   */
  getTransactions(query) {
    const { pageNo, limit } = query;
    return this.db.getDbData(
      COLLECTIONS.FT_TRANSACTION,
      {},
      undefined,
      { created_at: -1 },
      parseInt(pageNo, 10),
      parseInt(limit, 10),
    );
  }
}
