import { Schema } from 'mongoose';

export default new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  address: { type: String, requird: true },
  publickey: { type: String, requird: true },
  secretkey: { type: String, requird: true },
  shh_identity: { type: String },
  selected_coin_shield_contract: { type: String },
  selected_token_shield_contract: { type: String },
  coin_shield_contracts: [
    {
      contract_name: { type: String },
      contract_address: {
        type: String,
        trim: true,
        required: true,
        unique: true,
      },
    },
  ],
  token_shield_contracts: [
    {
      contract_name: { type: String },
      contract_address: {
        type: String,
        trim: true,
        required: true,
        unique: true,
      },
    },
  ],
  accounts: [
    {
      address: { type: String },
      password: { type: String },
    },
  ],
});
