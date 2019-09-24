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

    // receiver info
    receiver: String,
    receiver_address: String,

    // sender info
    sender: String,
    sender_address: String,
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);
