import { Schema } from 'mongoose';

export default new Schema(
  {
    type: {
      type: String,
      enum: ['minted', 'transferred', 'received', 'burned'],
      required: true,
    },
    token_uri: {
      type: String,
      required: true,
    },
    token_id: {
      type: String,
      required: true,
    },
    salt: {
      type: String,
      required: true,
    },
    token_commitment: {
      type: String,
      index: true,
      required: true,
    },
    token_commitment_index: {
      type: Number,
      required: true,
    },

    // transferee info
    transferee: String,

    transferred_salt: String,
    transferred_token_commitment: String,
    transferred_token_commitment_index: Number,
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
);
