import { Schema } from 'mongoose';

export default new Schema(
  {
    transactionType: {
      type: String,
      enum: ['mint', 'transfer_outgoing', 'transfer_incoming', 'burn'],
      required: true,
    },
    value: {
      type: String,
      required: true,
    },
    shieldContractAddress: {
      type: String,
      index: true,
    },

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
