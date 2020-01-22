import { Schema } from 'mongoose';

export default new Schema(
  {
    transactionType: {
      type: String,
      enum: ['mint', 'transfer_outgoing', 'transfer_incoming', 'burn', 'shield'],
      required: true,
    },
    tokenUri: {
      type: String,
      required: true,
    },
    tokenId: {
      type: String,
      index: true,
      required: true,
    },
    shieldContractAddress: String,

    // receiver info
    receiver: {
      name: String,
      address: String,
    },

    // sender info
    sender: {
      name: String,
      address: String,
    },
  },
  { timestamps: true },
);
