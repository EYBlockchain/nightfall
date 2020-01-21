import { COLLECTIONS } from '../common/constants';
import { nftCommitmentMapper } from '../mappers';
import NftCommitmentTransactionService from './nft-commitment-transaction.service';

export default class NftCommitmentService {
  constructor(_db) {
    this.db = _db;
    this.nftCommitmentTransactionService = new NftCommitmentTransactionService(_db);
  }

  /**
   * This function insert ERC-721 commitment (ft-commitment) transaction
   * in ft_commitment_transction collection
   * @param {object} data
   */
  insertNFTCommitmentTransaction(data) {
    const { isTransferred, isReceived, isBurned } = data;

    if (isReceived)
      return this.nftCommitmentTransactionService.insertTransaction({
        ...data,
        transactionType: 'transfer_incoming',
      });
    if (isTransferred)
      return this.nftCommitmentTransactionService.insertTransaction({
        ...data,
        transactionType: 'transfer_outgoing',
      });
    if (isBurned)
      return this.nftCommitmentTransactionService.insertTransaction({
        ...data,
        transactionType: 'burn',
      });

    return this.nftCommitmentTransactionService.insertTransaction({
      ...data,
      transactionType: 'mint',
    });
  }

  /**
   * This function inset ERC-721 commitment (nft-commitment)
   * either new minted or recived commitment in nft_commitment collection.
   * Also, will insert transaction in nft_commitment_transaction collection
   * @param {object} data
   */
  async insertNFTCommitment(data) {
    await this.db.saveData(COLLECTIONS.NFT_COMMITMENT, nftCommitmentMapper(data));
    return this.insertNFTCommitmentTransaction(data);
  }

  /**
   * This function update ERC-721 commitment (nft-commitment)
   * in nft_commitment collection, which is ethier transferred or burned commitment.
   * Also, will insert transaction in nft_commitment_transaction collection
   * @param {object} data
   */
  async updateNFTCommitmentByTokenId(tokenId, data) {
    const mappedData = nftCommitmentMapper(data);

    await this.db.updateData(
      COLLECTIONS.NFT_COMMITMENT,
      {
        tokenId,
        isTransferred: { $exists: false },
      },
      { $set: mappedData },
    );
  }

  /**
   * This function fetch use all token commitments
   * commitments which are in 'minted' or 'change' state.
   * @param {object} data - req query object containing public account
   * @returns {array} of coins transaction minted by that
   */
  getNFTCommitments(pageination) {
    if (!pageination || !pageination.pageNo || !pageination.limit) {
      return this.db.getData(COLLECTIONS.NFT_COMMITMENT, {
        isTransferred: { $exists: false },
        isBurned: { $exists: false },
      });
    }
    const { pageNo, limit } = pageination;
    return this.db.getDbData(
      COLLECTIONS.NFT_COMMITMENT,
      {
        isTransferred: { $exists: false },
        isBurned: { $exists: false },
      },
      undefined,
      { createdAt: -1 },
      parseInt(pageNo, 10),
      parseInt(limit, 10),
    );
  }

  /**
   * This function fetch ERC-721 commitment (nft-commitment) transactions
   * from nft_commitment_transction collection
   * @param {object} query
   */
  getNFTCommitmentTransactions(query) {
    return this.nftCommitmentTransactionService.getTransactions(query);
  }
}
