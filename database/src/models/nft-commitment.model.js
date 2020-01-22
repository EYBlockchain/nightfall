import { Schema } from 'mongoose';

export default new Schema(
  {
    tokenUri: {
      type: String,
      required: true,
    },
    tokenId: {
      type: String,
      required: true,
    },
    shieldContractAddress: String,
    salt: {
      type: String,
      required: true,
    },
    commitment: {
      type: String,
      unique: true,
      required: true,
    },
    commitmentIndex: {
      type: Number,
      required: true,
    },

    // receiver info
    owner: {
      name: String,
      publicKey: String,
    },

    // boolean stats
    isMinted: Boolean,
    isTransferred: Boolean,
    isBurned: Boolean,
    isReceived: Boolean,

    // boolean stats - correctness checks
    commitmentReconciles: Boolean, // for a given A, pk, S and z, do we have that h(A,pk,S)=z?
    commitmentExistsOnchain: Boolean, // does z exist on-chain?
  },
  { timestamps: true },
);
