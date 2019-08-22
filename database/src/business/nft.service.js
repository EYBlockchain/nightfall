import { COLLECTIONS } from '../common/constants';
import { nftMapper } from '../mappers';
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
    const mappedData = nftMapper(data);

    await this.db.saveData(COLLECTIONS.NFT, mappedData);

    if (isReceived)
      return this.nftTransactionService.insertTransaction({
        ...mappedData,
        type: 'received',
      });

    return this.nftTransactionService.insertTransaction({
      ...mappedData,
      type: 'minted',
    });
  }

  /**
   * This function update ERC-721 (nft)
   * in nft collection, which is ethier transferred, burned or shielded.
   * Also, will insert transaction in nft_transaction collection
   * @param {object} data
   */
  async updateNFToken(data) {
    const { tokenId, isBurned, isShielded } = data;
    const mappedData = nftMapper(data);

    await this.db.updateData(
      COLLECTIONS.NFT,
      {
        token_id: tokenId,
        is_transferred: { $exists: false },
        is_shielded: false,
      },
      { $set: mappedData },
    );

    if (isBurned)
      return this.nftTransactionService.insertTransaction({
        ...mappedData,
        type: 'burned',
      });
    if (isShielded)
      return this.nftTransactionService.insertTransaction({
        ...mappedData,
        type: 'shielded',
      });

    return this.nftTransactionService.insertTransaction({
      ...mappedData,
      type: 'transferred',
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
        shield_contract_address: query.shieldContractAddress ? query.shieldContractAddress : null,
        is_transferred: { $exists: false },
        is_burned: { $exists: false },
        is_shielded: false,
      });
    }
    const { pageNo, limit } = query;
    return this.db.getDbData(
      COLLECTIONS.NFT,
      {
        shield_contract_address: query.shieldContractAddress ? query.shieldContractAddress : null,
        is_transferred: { $exists: false },
        is_burned: { $exists: false },
        is_shielded: false,
      },
      undefined,
      { created_at: -1 },
      parseInt(pageNo, 10),
      parseInt(limit, 10),
    );
  }

  /**
   * This function fetch a ERC-721 (nft) token by tokenId
   * @param {string} tokenId - unique tokenId generated at mint
   * @returns {Promise}
   */
  getNFToken(tokenId) {
    return this.db.findOne(COLLECTIONS.NFT, {
      token_id: tokenId,
      is_transferred: { $exists: false },
    });
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
