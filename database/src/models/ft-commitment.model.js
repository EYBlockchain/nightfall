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
    commitment_index: {
      type: Number,
      required: true,
    },

    owner: {
      name: {
        type: String,
      },
      public_key: {
        type: String,
      },
    },

    // boolean stats
    is_minted: Boolean,
    is_transferred: Boolean,
    is_burned: Boolean,
    is_received: Boolean,
    is_change: Boolean,
    is_batch_transferred: Boolean,

    // boolean stats - correctness checks
    commitment_reconciles: Boolean, // for a given A, pk, S and z, do we have that h(A,pk,S)=z?
    commitment_exists_onchain: Boolean, // does z exist on-chain?
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);
