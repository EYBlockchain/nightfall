import { Schema } from 'mongoose';

export default new Schema(
  {
    type: {
      type: String,
      enum: ['minted', 'transferred', 'received', 'burned', 'shielded'],
      required: true,
    },
    uri: {
      type: String,
      required: true,
    },
    token_id: {
      type: String,
      index: true,
      required: true,
    },
    shield_contract_address: String,

    // transferee info
    transferee: String,
    transferee_address: String,

    // transferor info
    transferor: String,
    transferor_address: String,
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);
