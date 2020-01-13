import { COLLECTIONS } from '../common/constants';
import { ftCommitmentMapper, ftCommitmentTransferTransactionMapper } from '../mappers';
import FtCommitmentTransactionService from './ft-commitment-transaction.service';

export default class FtCommitmentService {
  constructor(_db) {
    this.db = _db;
    this.ftCommitmentTransactionService = new FtCommitmentTransactionService(_db);
  }

  /**
   * This function insert ERC-20 commitment (ft-commitment) transaction
   * in ft_commitment_transction collection
   * @param {object} data
   */
  insertFTCommitmentTransaction(data) {
    const { isTransferred, isReceived, isChange, isBurned, isBatchTransferred } = data;

    const mappedData = ftCommitmentTransferTransactionMapper(data);

    if (isReceived)
      return this.ftCommitmentTransactionService.insertTransaction({
        ...mappedData,
        transaction_type: 'transfer_incoming',
      });
    if (isTransferred || isBatchTransferred)
      return this.ftCommitmentTransactionService.insertTransaction({
        ...mappedData,
        transaction_type: 'transfer_outgoing',
      });
    if (isBurned)
      return this.ftCommitmentTransactionService.insertTransaction({
        ...mappedData,
        transaction_type: 'burn',
      });
    if (isChange)
      return this.ftCommitmentTransactionService.insertTransaction({
        ...mappedData,
        transaction_type: 'change',
      });

    return this.ftCommitmentTransactionService.insertTransaction({
      ...mappedData,
      transaction_type: 'mint',
    });
  }

  /**
   * This function will add new coin to database
   * @param {object} data - contains all the atributes required while minting a coin
   */
  async insertFTCommitment(data) {
    await this.db.saveData(COLLECTIONS.FT_COMMITMENT, ftCommitmentMapper(data));
    return this.insertFTCommitmentTransaction(data);
  }

  /**
   * This function will update coin for transfer and burn
   * @param {object} data - contains all the atributes required while transfer and burn of a coin
   */
  async updateFTCommitmentByCommitmentHash(commitmentHash, data) {
    const mappedData = ftCommitmentMapper(data);
    await this.db.updateData(
      COLLECTIONS.FT_COMMITMENT,
      {
        commitment: commitmentHash,
        is_transferred: { $exists: false },
        is_batch_transferred: { $exists: false },
      },
      { $set: mappedData },
    );
  }

  /**
   * This function is used to find all the coins
   * Coin which are in 'minted' or 'change' state.
   * @param {object} data - req query object containing public account
   * @returns {array} of coins transaction minted by that
   */
  getFTCommitments(pageination) {
    if (!pageination || !pageination.pageNo || !pageination.limit) {
      return this.db.getData(COLLECTIONS.FT_COMMITMENT, {
        is_transferred: { $exists: false },
        is_batch_transferred: { $exists: false },
        is_burned: { $exists: false },
      });
    }
    const { pageNo, limit } = pageination;
    return this.db.getDbData(
      COLLECTIONS.FT_COMMITMENT,
      {
        is_transferred: { $exists: false },
        is_burned: { $exists: false },
      },
      undefined,
      { created_at: -1 },
      parseInt(pageNo, 10),
      parseInt(limit, 10),
    );
  }

  /**
   * This function fetch ERC-20 commitment (ft-commitment) transactions
   * from ft_commitment_transction collection
   * @param {object} query
   */
  getFTCommitmentTransactions(query) {
    return this.ftCommitmentTransactionService.getTransactions(query);
  }
}
