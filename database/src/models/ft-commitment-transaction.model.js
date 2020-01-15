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
          name: {
            type: String,
          },
          publicKey: {
            type: String,
          },
        },
      },
    ],

    outputCommitments: [
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
          name: {
            type: String,
          },
          publicKey: {
            type: String,
          },
        },
      },
    ],

    sender: {
      publicKey: {
        type: String,
      },
      name: {
        type: String,
      },
    },
    receiver: {
      publicKey: {
        type: String,
      },
      name: {
        type: String,
      },
    },
  },
  { timestamps: true },
);
