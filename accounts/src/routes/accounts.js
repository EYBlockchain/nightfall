import express from 'express';
import { unlockAccount } from '../services/accounts';

const router = express.Router({ mergeParams: true });

async function unlockUserAccount(req, res, next) {
  const { address, password } = req.body;

  try {
    await unlockAccount(address, password);
    res.data = { message: 'Unlocked' };
    next();
  } catch (err) {
    next(err);
  }
}

router.post('/unlock', unlockUserAccount);

export default router;
