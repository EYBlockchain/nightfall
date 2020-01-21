import { COLLECTIONS } from '../common/constants';
import NftTransactionService from './nft-transaction.service';

export default class NftService {
  constructor(_db) {
    this.db = _db;
    this.nftTransactionService = new NftTransactionService(_db);
  }

  /**
   * This function inset ERC-721(nft)
   * either new minted or recived token in nft collection.
   * Also, will insert transaction in nft_transaction collection
   * @param {object} data
   */
  async addNFToken(data) {
    const { isReceived } = data;

    await this.db.saveData(COLLECTIONS.NFT, data);

    if (isReceived)
      return this.nftTransactionService.insertTransaction({
        ...data,
        transactionType: 'transfer_incoming',
      });

    return this.nftTransactionService.insertTransaction({
      ...data,
      transactionType: 'mint',
    });
  }

  /**
   * This function update ERC-721 (nft)
   * in nft collection, which is ethier transferred, burned or shielded.
   * Also, will insert transaction in nft_transaction collection
   * @param {object} data
   */
  async updateNFTokenByTokenId(tokenId, data) {
    const { isBurned, isShielded } = data;

    await this.db.updateData(
      COLLECTIONS.NFT,
      {
        tokenId,
        isTransferred: { $exists: false },
        isShielded: { $exists: false },
      },
      { $set: data },
    );

    if (isBurned)
      return this.nftTransactionService.insertTransaction({
        ...data,
        transactionType: 'burn',
      });
    if (isShielded)
      return this.nftTransactionService.insertTransaction({
        ...data,
        transactionType: 'shield',
      });

    return this.nftTransactionService.insertTransaction({
      ...data,
      transactionType: 'transfer_outgoing',
    });
  }

  /**
   * This function fetch all ERC-721 (nft) tokens
   * which are in minted.
   * @param {object} data - req query object containing public account
   * @returns {Promise} array of coins transaction minted by that
   */
  getNFTokens(query) {
    if (!query || !query.pageNo || !query.limit) {
      return this.db.getData(COLLECTIONS.NFT, {
        isTransferred: { $exists: false },
        isBurned: { $exists: false },
        isShielded: { $exists: false },
      });
    }
    const { pageNo, limit } = query;
    return this.db.getDbData(
      COLLECTIONS.NFT,
      {
        isTransferred: { $exists: false },
        isBurned: { $exists: false },
        isShielded: { $exists: false },
      },
      undefined,
      { createdAt: -1 },
      parseInt(pageNo, 10),
      parseInt(limit, 10),
    );
  }

  /**
   * This function fetch ERC-721 (nft) transactions
   * from nft_transction collection
   * @param {object} query
   */
  getNFTTransactions(query) {
    return this.nftTransactionService.getTransactions(query);
  }
}
