import FtTransactionService from './ft-transaction.service';

export default class FtService {
  constructor(_db) {
    this.db = _db;
    this.ftTransactionService = new FtTransactionService(_db);
  }

  /**
   * This function insert ERC-20 (ft) transaction
   * in ft_transction collection
   * @param {object} data
   */
  insertFTokenTransaction(data) {
    const { isReceived, isTransferred, isBurned } = data;

    if (isReceived)
      return this.ftTransactionService.insertTransaction({
        ...data,
        transactionType: 'transfer_incoming',
      });
    if (isTransferred)
      return this.ftTransactionService.insertTransaction({
        ...data,
        transactionType: 'transfer_outgoing',
      });
    if (isBurned)
      return this.ftTransactionService.insertTransaction({
        ...data,
        transactionType: 'burn',
      });

    return this.ftTransactionService.insertTransaction({
      ...data,
      transactionType: 'mint',
    });
  }

  /**
   * This function fetch ERC-20 (ft) transactions
   * in ft_transction collection
   * @param {object} query
   */
  getFTTransactions(query) {
    return this.ftTransactionService.getTransactions(query);
  }
}
