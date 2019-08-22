import { Schema } from 'mongoose';

export default new Schema(
  {
    type: {
      type: String,
      enum: ['minted', 'transferred', 'received', 'burned', 'change'],
      required: true,
    },
    coin_value: {
      type: String,
      required: true,
    },
    salt: {
      type: String,
      required: true,
    },
    coin_commitment: {
      type: String,
      index: true,
      required: true,
    },
    coin_commitment_index: {
      type: Number,
      required: true,
    },

    // incase transfer log only
    used_coin_commitments: [
      {
        coin_value: String,
        coin_commitment: String,
      },
    ],

    // transferee info
    transferee: String,

    // coin info transferred to transferee
    transferred_coin_value: String,
    transferred_salt: String,
    transferred_coin_commitment: String,
    transferred_coin_commitment_index: String,

    // coin info of change got from transfer
    change_coin_value: String,
    change_salt: String,
    change_coin_ommitment: String,
    change_coin_commitment_index: Number,
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
);
