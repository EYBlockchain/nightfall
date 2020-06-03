import { Schema } from 'mongoose';

export default new Schema(
  {
    users: [
      {
        name: {
          type: String,
          required: true,
          unique: true,
        },
        address: {
          type: String,
          requird: true,
          unique: true,
        },
      },
    ],
  },
  { timestamps: true },
);
