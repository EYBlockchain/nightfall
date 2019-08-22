import { COLLECTIONS } from '../common/constants';
import { nftCommitmentMapper } from '../mappers';
import NftCommitmentTransactionService from './nft-commitment-transaction.service';

export default class NftCommitmentService {
  constructor(_db) {
    this.db = _db;
    this.nftCommitmentTransactionService = new NftCommitmentTransactionService(_db);
  }

  /**
   * This function inset ERC-721 commitment (nft-commitment)
   * either new minted or recived commitment in nft_commitment collection.
   * Also, will insert transaction in nft_commitment_transaction collection
   * @param {object} data
   */
  async addNewToken(data) {
    const { isReceived } = data;
    const mappedData = nftCommitmentMapper(data);

    await this.db.saveData(COLLECTIONS.NFT_COMMITMENT, mappedData);

    if (isReceived)
      return this.nftCommitmentTransactionService.insertTransaction({
        ...mappedData,
        type: 'received',
      });

    return this.nftCommitmentTransactionService.insertTransaction({
      ...mappedData,
      type: 'minted',
    });
  }

  /**
   * This function update ERC-721 commitment (nft-commitment)
   * in nft_commitment collection, which is ethier transferred or burned commitment.
   * Also, will insert transaction in nft_commitment_transaction collection
   * @param {object} data
   */
  async updateToken(data) {
    const { tokenId, isBurned } = data;
    const mappedData = nftCommitmentMapper(data);

    await this.db.updateData(
      COLLECTIONS.NFT_COMMITMENT,
      {
        token_id: tokenId,
        is_transferred: { $exists: false },
      },
      { $set: mappedData },
    );

    if (isBurned)
      return this.nftCommitmentTransactionService.insertTransaction({
        ...mappedData,
        type: 'burned',
      });

    return this.nftCommitmentTransactionService.insertTransaction({
      ...mappedData,
      type: 'transferred',
    });
  }

  /**
   * This function fetch use all token commitments
   * commitments which are in 'minted' or 'change' state.
   * @param {object} data - req query object containing public account
   * @returns {array} of coins transaction minted by that
   */
  getToken(pageination) {
    if (!pageination || !pageination.pageNo || !pageination.limit) {
      return this.db.getData(COLLECTIONS.NFT_COMMITMENT, {
        is_transferred: { $exists: false },
        is_burned: { $exists: false },
      });
    }
    const { pageNo, limit } = pageination;
    return this.db.getDbData(
      COLLECTIONS.NFT_COMMITMENT,
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
   * This function fetch ERC-721 commitment (nft-commitment) transactions
   * from nft_commitment_transction collection
   * @param {object} query
   */
  getPrivateTokenTransactions(query) {
    return this.nftCommitmentTransactionService.getTransactions(query);
  }
}
