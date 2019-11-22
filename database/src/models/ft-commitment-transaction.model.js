import { Schema } from 'mongoose';

export default new Schema(
  {
    type: {
      type: String,
      enum: ['minted', 'transferred', 'received', 'burned', 'change', 'batchTransfer'],
      required: true,
    },
    ft_commitment_value: {
      type: String,
      required: true,
    },
    salt: {
      type: String,
      required: true,
    },
    ft_commitment: {
      type: String,
      index: true,
      required: true,
    },
    ft_commitment_index: {
      type: Number,
      required: true,
    },

    batch_transfer: [
      {
        ft_commitment_value: String,
        salt: String,
        ft_commitment: String,
        ft_commitment_index: String,
        receiver: String,
      },
    ],

    // incase transfer log only
    used_ft_commitments: [
      {
        ft_commitment_value: String,
        ft_commitment: String,
      },
    ],

    // receiver info
    receiver: String,

    // coin info transferred to receiver
    transferred_ft_commitment_value: String,
    transferred_salt: String,
    transferred_ft_commitment: String,
    transferred_ft_commitment_index: String,

    // coin info of change got from transfer
    change_ft_commitment_value: String,
    change_salt: String,
    change_ft_ommitment: String,
    change_ft_commitment_index: Number,
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  },
);
