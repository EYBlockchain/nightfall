import { COLLECTIONS } from '../common/constants';

export default class NftTransactionService {
  constructor(_db) {
    this.db = _db;
  }

  /**
   * This function add record in nft_transaction tables.
   * @param {Object} data
   * data = {
   *  tokenUri,
   *  tokenId,
   *  shieldcontractAddress,
   *  transactionType,
   *  sender: {
   *    name,
   *    address,
   *  },
   *  receiver: {
   *    name,
   *    address,
   *  }
   * }
   */
  insertTransaction(data) {
    return this.db.saveData(COLLECTIONS.NFT_TRANSACTION, data);
  }

  /**
   * This function fetch ERC-721 (nft) transactions
   * from nft_transction collection
   * @param {object} query
   */
  getTransactions(query) {
    const { pageNo, limit } = query;
    return this.db.getDbData(
      COLLECTIONS.NFT_TRANSACTION,
      {},
      undefined,
      { createdAt: -1 },
      parseInt(pageNo, 10),
      parseInt(limit, 10),
    );
  }
}
