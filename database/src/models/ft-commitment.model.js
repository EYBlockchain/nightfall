import { Schema } from 'mongoose';

export default new Schema(
  {
    value: {
      type: String,
      required: true,
    },
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

    owner: {
      name: {
        type: String,
      },
      publicKey: {
        type: String,
      },
    },

    // boolean stats
    isMinted: Boolean,
    isTransferred: Boolean,
    isBurned: Boolean,
    isReceived: Boolean,
    isChange: Boolean,
    isBatchTransferred: Boolean,

    // boolean stats - correctness checks
    commitmentReconciles: Boolean, // for a given A, pk, S and z, do we have that h(A,pk,S)=z?
    commitmentExistsOnchain: Boolean, // does z exist on-chain?
  },
  { timestamps: true },
);
