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

    // receiver info
    receiver: String,
    receiver_address: String,

    // sender info
    sender: String,
    sender_address: String,
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);
