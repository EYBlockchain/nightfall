import { Schema } from 'mongoose';

export default new Schema(
  {
    type: {
      type: String,
      enum: ['minted', 'transferred', 'received', 'burned'],
      required: true,
    },
    amount: {
      type: String,
      required: true,
    },
    shield_contract_address: {
      type: String,
      index: true,
    },

    // transferee info
    transferee: String,
    transferee_address: String,

    // transferor info
    transferor: String,
    transferor_address: String,
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);
