import { Schema } from 'mongoose';

export default new Schema(
  {
    coin_value: {
      type: String,
      required: true,
    },
    salt: {
      type: String,
      required: true,
    },
    coin_commitment: {
      type: String,
      unique: true,
      required: true,
    },
    coin_commitment_index: {
      type: Number,
      required: true,
    },

    // transferee info
    transferee: String,

    // coin info transferred to transferee
    transferred_coin_value: String,
    transferred_salt: String,
    transferred_coin_commitment: String,
    transferred_coin_commitment_index: String,

    // coin info of change got from transfer
    change_coin_value: String,
    change_salt: String,
    change_coin_ommitment: String,
    change_coin_commitment_index: Number,

    // boolean stats
    is_minted: Boolean,
    is_transferred: Boolean,
    is_burned: Boolean,
    is_received: Boolean,
    is_change: Boolean,

    // boolean stats - correctness checks
    coin_commitment_reconciles: Boolean, // for a given A, pk, S and z, do we have that h(A,pk,S)=z?
    coin_commitment_exists_onchain: Boolean, // does z exist on-chain?
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);
