import { Schema } from 'mongoose';

export default new Schema(
  {
    transactionType: {
      type: String,
      enum: ['mint', 'transfer_outgoing', 'transfer_incoming', 'burn'],
      required: true,
    },
    inputCommitments: [
      {
        tokenUri: {
          type: String,
          required: true,
        },
        tokenId: {
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
        tokenUri: {
          type: String,
          required: true,
        },
        tokenId: {
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

    sender: {
      publicKey: String,
      name: String,
    },

    receiver: {
      publicKey: String,
      name: String,
      address: String,
    },
  },
  {
    timestamps: true,
  },
);
