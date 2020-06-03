import { Schema } from 'mongoose';

export default new Schema(
  {
    transactionType: {
      type: String,
      enum: ['mint', 'transfer_outgoing', 'transfer_incoming', 'change', 'burn'],
      required: true,
    },

    inputCommitments: [
      {
        value: {
          type: String,
          required: true,
        },
        salt: {
          type: String,
          required: true,
        },
        commitment: {
          type: String,
          index: true,
          required: true,
        },
        commitmentIndex: {
          type: Number,
          required: true,
        },
        owner: {
          name: String,
          publicKey: String,
        },
      },
    ],

    outputCommitments: [
      {
        value: {
          type: String,
          required: true,
        },
        owner: {
          name: String,
          publicKey: String,
        },
        salt: String,
        commitment: String,
        commitmentIndex: Number,
      },
    ],

    sender: {
      publicKey: String,
      name: String,
    },
    receiver: {
      publicKey: String,
      name: String,
      address: String,
    },

    isFailed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);
