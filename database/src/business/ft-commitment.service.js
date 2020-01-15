import { COLLECTIONS } from '../common/constants';
import { ftCommitmentMapper } from '../mappers';
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

    if (isReceived)
      return this.ftCommitmentTransactionService.insertTransaction({
        ...data,
        transactionType: 'transfer_incoming',
      });
    if (isTransferred || isBatchTransferred)
      return this.ftCommitmentTransactionService.insertTransaction({
        ...data,
        transactionType: 'transfer_outgoing',
      });
    if (isBurned)
      return this.ftCommitmentTransactionService.insertTransaction({
        ...data,
        transactionType: 'burn',
      });
    if (isChange)
      return this.ftCommitmentTransactionService.insertTransaction({
        ...data,
        transactionType: 'change',
      });

    return this.ftCommitmentTransactionService.insertTransaction({
      ...data,
      transactionType: 'mint',
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
        isTransferred: { $exists: false },
        isBatchTransferred: { $exists: false },
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
        isTransferred: { $exists: false },
        isBatchTransferred: { $exists: false },
        isBurned: { $exists: false },
      });
    }
    const { pageNo, limit } = pageination;
    return this.db.getDbData(
      COLLECTIONS.FT_COMMITMENT,
      {
        isTransferred: { $exists: false },
        isBatchTransferred: { $exists: false },
        isBurned: { $exists: false },
      },
      undefined,
      { createdAt: -1 },
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
