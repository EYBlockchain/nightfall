import { Schema } from 'mongoose';

export default new Schema(
  {
    tokenUri: {
      type: String,
      trim: true,
      required: true,
    },
    tokenId: {
      type: String,
      index: true,
      required: true,
    },
    shieldContractAddress: String,

    // boolean stats
    isShielded: Boolean,
    isMinted: Boolean,
    isReceived: Boolean,
    isTransferred: Boolean,
    isBurned: Boolean,

    // receiver info
    receiver: {
      name: String,
      address: String,
    },

    // sender info
    sender: {
      name: String,
      address: String,
    },
  },
  { timestamps: true },
);
