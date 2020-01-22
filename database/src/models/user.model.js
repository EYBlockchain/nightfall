import { Schema } from 'mongoose';

export default new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  address: { type: String, requird: true },
  publicKey: { type: String, requird: true },
  secretKey: { type: String, requird: true },
  shhIdentity: { type: String },
  selectedFTokenShield: { type: String },
  selectedNFTokenShield: { type: String },
  fTokenShields: [
    {
      contractName: { type: String },
      contractAddress: {
        type: String,
        trim: true,
        required: true,
        unique: true,
      },
    },
  ],
  nfTokenShields: [
    {
      contractName: { type: String },
      contractAddress: {
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
