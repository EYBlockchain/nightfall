import express from 'express';
import { newAccount, sendEtherToAccount, getBalance, pay } from '../services/accounts';

const router = express.Router({ mergeParams: true });

async function createAccount(req, res, next) {
  const { password } = req.body;
  try {
    const address = await newAccount(password);
    if (password) {
      await sendEtherToAccount(address);
    }
    res.data = address;
    next();
  } catch (err) {
    next(err);
  }
}

async function getAccountBalance(req, res, next) {
  const { address } = req.params;
  const balance = await getBalance(address);
  res.data = balance;
  next();
}

async function transferEther(req, res, next) {
  const { address } = req.params;
  const { from, amount } = req.body;
  try {
    const txHash = await pay(address, from, amount);
    res.data = txHash;
    next();
  } catch (err) {
    next(err);
  }
}

router.post('/new', createAccount);
router.post('/anonymous', createAccount);
router.get('/:address', getAccountBalance);
router.put('/pay/:address', transferEther);

export default router;
