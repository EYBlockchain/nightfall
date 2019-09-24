import { Schema } from 'mongoose';

export default new Schema(
  {
    uri: {
      type: String,
      trim: true,
      required: true,
    },
    token_id: {
      type: String,
      index: true,
      required: true,
    },
    shield_contract_address: String,

    // boolean stats
    is_shielded: {
      type: Boolean,
      default: false,
    },
    is_minted: Boolean,
    is_received: Boolean,
    is_transferred: Boolean,
    is_burned: Boolean,

    // receiver info
    receiver: String,
    receiver_address: String,

    // sender info
    sender: String,
    sender_address: String,
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);
