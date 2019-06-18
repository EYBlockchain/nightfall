let { COLLECTIONS } = require('../common/constants.json')
let {coinMapper, coinReceiverMapper}  = require('../mappers/coin')
const CoinTransactionService = require('./coin_transaction.service');
let PublicCoinTransactionService = require('./public_coin_transaction.service')

module.exports = class CoinService {
    constructor(_db) {
        this.db = _db;
        this.coinTransactionService = new CoinTransactionService(_db);
        this.publicCoinTransactionService = new PublicCoinTransactionService(_db);
    }


    async addFTokenTransaction (data) {
        const {
            is_minted,
            is_received,
            is_transferred,
            is_burned
        } = data;

        if (is_received)
            return await this.publicCoinTransactionService.insertTransaction({ ...data, type: "received" });
        if (is_minted)
            return await this.publicCoinTransactionService.insertTransaction({ ...data, type: "minted" });
        if (is_transferred)
            return await this.publicCoinTransactionService.insertTransaction({ ...data, type: "transferred" });
        if (is_burned)
            return await this.publicCoinTransactionService.insertTransaction({ ...data, type: "burned" });
    }


    async getFTTransactions (query) {
        return await this.publicCoinTransactionService.getTransactions(query);
    }



    /**
     * This function will add new coin to database
     * @param {object} data - contains all the atributes required while minting a coin
     */
    async addNewCoin(data) {
        const {
            coin_value,
            sender_public_key,
            salt,
            coin_commitment,
            coin_commitment_index
        } = coinMapper(data);

        //Add coin mint transaction to coin-transaction history
        await this.coinTransactionService.addNewCoinTransaction(data);

        let transaction = {
            coin_value,
            sender_public_key,
            salt,
            coin_commitment,
            coin_commitment_index,
            type: 'minted'
        };
        return await this.db.saveData(COLLECTIONS.COIN, transaction);
    };


    async addNewCoinOnReceiverSide(data) {
        const {
            coin_value,
            sender_public_key,
            salt,
            coin_commitment,
            coin_commitment_index,
            coin_commitment_reconciles,
            coin_commitment_exists_onchain
        } = coinReceiverMapper(data);
        //Add coin mint transaction to coin-transaction history
        await this.coinTransactionService.addNewCoinTransaction(data);

        let transaction = {
            coin_value,
            sender_public_key,
            salt,
            coin_commitment,
            coin_commitment_index,
            coin_commitment_reconciles,
            coin_commitment_exists_onchain,
            type: 'received'
        }
        return await this.db.saveData(COLLECTIONS.COIN, transaction);
    };

    /**
     * This function is used to find all the coins associated with a public ethereum account
     * Coin which are in 'minted' or 'change' state.
     * @param {object} data - req query object containing public account
     * @returns {array} of coins transaction minted by that
     */
    async getCoinByAccount() {
        let collection = COLLECTIONS.COIN
        return await this.db.getDbValues(
            collection,
            {"transfer_timestamp":{ $exists: false}, "burn_timestamp":{ $exists: false}, coin_value: { $ne: '0x00000000000000000000000000000000' }},
            
        );
    }

    async updateCoins(data) {
        const {
            coins,
            receiver_public_key,
            receiver_coin_commitment,
            returned_coin_commitment,
            receiver_coin_value,
            returned_coin_value,
            receiver_name,
            receiver_coin_commitment_index,
            returned_coin_commitment_index
        } = coinMapper(data);

        for (var i = 0; i < coins.length; i++) {
            var coin = coins[i]
            await this.db.updateData(
                COLLECTIONS.COIN,
                {
                    "coin_value": coin.coin_value,
                    "salt": coin.salt,
                },
                {
                    '$set': {
                        'receiver_public_key': receiver_public_key,
                        'transfer_timestamp': new Date(),
                        'receiver_coin_commitment': receiver_coin_commitment,
                        'returned_coin_commitment': returned_coin_commitment,
                        'receiver_coin_value': receiver_coin_value,
                        'returned_coin_value': returned_coin_value,
                        receiver_coin_commitment_index,
                        returned_coin_commitment_index,
                        'type': 'transfer',
                        'receiver_name': receiver_name
                    }
                }
            );
        }
        //capture coin transfer transaction and add to coin-transaction history
        await this.coinTransactionService.addNewCoinTransaction(data);
    }

    async  addReturnCoins(data) {
        const {
            returned_coin_value,
            receiver_coin_value,
            sender_public_key,
            receiver_public_key,
            returned_salt,
            receiver_salt,
            returned_coin_commitment,
            receiver_coin_commitment,
            returned_coin_commitment_index,
            receiver_coin_commitment_index
        } = coinMapper(data);

        const {
            sender_account,
            recevier_account
        } = data;

        //Inserting coin change
        let transactions = {
            coin_value: returned_coin_value,
            sender_public_key,
            salt: returned_salt,
            coin_commitment: returned_coin_commitment,
            coin_commitment_index: returned_coin_commitment_index,
            type: 'change'
        }
        await this.db.saveData(
            COLLECTIONS.COIN,
            transactions
        );

        //TODO-- db change -- history
        //capture coin change transaction and add to coin-transaction history
        data.action_type = 'change';
        await this.coinTransactionService.addNewCoinTransaction(data);
    };

    async  updateBurnedCoin(data) {
        const {
            coin_value,
            salt,
            burn_coin_commitment,
            burn_coin_commitment_index
        } = coinMapper(data);
        //Add coin burn transaction to coin-transaction history
        await this.coinTransactionService.addNewCoinTransaction(data);

        await this.db.updateData(
            COLLECTIONS.COIN,
            {
                "coin_value": coin_value,
                "salt": salt,
            },
            {
                '$set': {
                    'burn_coin_commitment': burn_coin_commitment,
                    'burn_timestamp': new Date(),
                    burn_coin_commitment_index,
                    'type': 'burned'
                }
            }
        );
    }

    async getPrivateCoinTransactions(query) {
        const {pageNo, limit } = query
        let collection = COLLECTIONS.COIN_TRANSACTION
        return await this.db.getDbData(
            collection,
            null,
            null,
            { timestamp: -1 },
            parseInt(pageNo),
            parseInt(limit)
        );
    }

}
