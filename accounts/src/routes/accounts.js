import express from 'express';
import {
  newAccount,
  transferEtherToAccount,
  getBalance,
  unlockAccount,
} from '../services/accounts';

const router = express.Router({ mergeParams: true });

async function createAccount(req, res, next) {
  const { password } = req.body;
  try {
    const address = await newAccount(password);
    if (password) {
      await transferEtherToAccount(address);
    }
    res.data = address;
    next();
  } catch (err) {
    next(err);
  }
}

async function getAccountBalance(req, res, next) {
  const { accountAddress } = req.query;
  const balance = await getBalance(accountAddress);
  res.data = balance;
  next();
}

async function transferEther(req, res, next) {
  const { from, amount, address } = req.body;
  try {
    const txHash = await transferEtherToAccount(address, from, amount);
    res.data = txHash;
    next();
  } catch (err) {
    next(err);
  }
}

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

router.post('/createAccount', createAccount);
router.get('/getAccountBalance', getAccountBalance);
router.post('/unlockAccount', unlockUserAccount);
router.post('/transferEther', transferEther);

export default router;
